import { useRef, useState, type ReactNode } from "react";
import { useFormContext, useWatch, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { publicLabelClass } from "@/components/proposal/public-list-pattern";
import { browserCepFetch, cepDigits, lookupCep, type CepFetch } from "@/lib/cep-lookup";
import {
  ADDRESS_LABELS,
  CEP_LOOKUP_ERROR,
  CITY_STATE_LABELS,
  UF_SIGLAS,
  applyAddressLookup,
  applyUfChoice,
  formatCep,
  requestsLookup,
  type AddressValues,
  type AddressWidgets,
  INPUT_WIDGETS,
} from "./address-fields-model";
import { loadMunicipalities } from "./load-municipalities";

export type AddressNames = {
  cep?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
};

type AddressFieldsProps = {
  variant: "panel" | "public";
  scope?: "full" | "cityState";
  names: AddressNames;
  inputClassName?: string;
  fetchImpl?: CepFetch;
  stateOverride?: { loading: boolean; error: string | null; widgets: AddressWidgets };
};

const emptyAddress: AddressValues = {
  cep: "",
  street: "",
  streetNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function readValues(get: (name: string) => unknown, names: AddressNames, localCep: string): AddressValues {
  const text = (name: string | undefined, fallback = "") => {
    if (!name) return fallback;
    const value = get(name);
    return typeof value === "string" ? value : fallback;
  };
  return {
    cep: names.cep ? text(names.cep) : localCep,
    street: text(names.street),
    streetNumber: text(names.streetNumber),
    complement: text(names.complement),
    neighborhood: text(names.neighborhood),
    city: text(names.city),
    state: text(names.state),
  };
}

export function AddressFields({
  variant,
  scope = "full",
  names,
  inputClassName,
  fetchImpl = browserCepFetch,
  stateOverride,
}: AddressFieldsProps) {
  const { control, getValues, setValue } = useFormContext();
  const watchedNames = [
    names.cep,
    names.street,
    names.streetNumber,
    names.complement,
    names.neighborhood,
    names.city,
    names.state,
  ].filter((name): name is string => Boolean(name));
  useWatch({ control, name: watchedNames as FieldPath<FieldValues>[] });
  const [localCep, setLocalCep] = useState("");
  const [widgets, setWidgets] = useState<AddressWidgets>(INPUT_WIDGETS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentDigits = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const labelClass = variant === "public" ? publicLabelClass : undefined;
  const inputClass = variant === "public" ? inputClassName : undefined;

  const snapshot = () => readValues((name) => getValues(name as FieldPath<FieldValues>), names, localCep);

  const write = (patch: Partial<AddressValues>) => {
    const assign = (name: string | undefined, value: string | undefined) => {
      if (!name || value === undefined) return;
      setValue(name as FieldPath<FieldValues>, value, { shouldDirty: true });
    };
    if (patch.cep !== undefined) {
      if (names.cep) assign(names.cep, patch.cep);
      else setLocalCep(patch.cep);
    }
    assign(names.street, patch.street);
    assign(names.streetNumber, patch.streetNumber);
    assign(names.complement, patch.complement);
    assign(names.neighborhood, patch.neighborhood);
    assign(names.city, patch.city);
    assign(names.state, patch.state);
  };

  const search = async (raw: string) => {
    const previous = snapshot();
    const digits = requestsLookup(cepDigits(previous.cep), raw);
    const typed = cepDigits(raw);
    write({ cep: typed });
    currentDigits.current = typed;
    if (!digits) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    const result = await lookupCep(digits, {
      fetchImpl,
      signal: controller.signal,
      currentDigits: () => currentDigits.current,
    });
    if (controller.signal.aborted || currentDigits.current !== digits) {
      setLoading(false);
      return;
    }

    const needsCities =
      result.status === "failed" ||
      (result.status === "filled" && !result.address.street && !result.address.neighborhood);
    const uf = result.status === "filled" ? result.address.state : snapshot().state;
    const cities = needsCities ? await loadMunicipalities(uf, fetchImpl, controller.signal) : null;
    if (currentDigits.current !== digits) {
      setLoading(false);
      return;
    }

    const next = applyAddressLookup({ ...snapshot(), cep: digits }, result, cities);
    write({
      street: next.values.street,
      neighborhood: next.values.neighborhood,
      city: next.values.city,
      state: next.values.state,
    });
    setWidgets(next.widgets);
    setError(next.error);
    setLoading(false);
  };

  const chooseUf = async (uf: string) => {
    const controller = new AbortController();
    const cities = await loadMunicipalities(uf, fetchImpl, controller.signal);
    const next = applyUfChoice(snapshot(), uf, cities, error);
    write({ state: next.values.state });
    setWidgets(next.widgets);
  };

  const values = snapshot();
  const shownWidgets = stateOverride?.widgets ?? widgets;
  const shownError = stateOverride?.error ?? error;
  const shownLoading = stateOverride?.loading ?? loading;
  const labels = scope === "cityState" ? CITY_STATE_LABELS : ADDRESS_LABELS;

  return (
    <div data-address-fields={variant} data-address-scope={scope} className="space-y-4">
      <p className="sr-only">{labels.join(", ")}</p>
      <Field label="CEP" labelClass={labelClass} error={error}>
        <Input
          value={formatCep(values.cep)}
          inputMode="numeric"
          autoComplete="postal-code"
          aria-invalid={error ? true : undefined}
          className={inputClass}
          onChange={(event) => {
            void search(event.target.value);
          }}
        />
        {shownLoading ? <p className="text-sm text-muted-foreground">Buscando CEP...</p> : null}
        {shownError ? <p className="text-sm text-destructive">{shownError}</p> : null}
      </Field>

      {scope === "full" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NamedField control={control} name={names.street} label="Logradouro" labelClass={labelClass} inputClass={inputClass} autoComplete="address-line1" />
            <NamedField control={control} name={names.streetNumber} label="Número" labelClass={labelClass} inputClass={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NamedField control={control} name={names.complement} label="Complemento" labelClass={labelClass} inputClass={inputClass} autoComplete="address-line2" />
            <NamedField control={control} name={names.neighborhood} label="Bairro" labelClass={labelClass} inputClass={inputClass} />
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shownWidgets.city === "select" ? (
          <SelectField
            label="Cidade"
            labelClass={labelClass}
            inputClass={inputClass}
            value={values.city}
            options={shownWidgets.cityOptions}
            onChange={(city) => write({ city })}
          />
        ) : (
          <NamedField control={control} name={names.city} label="Cidade" labelClass={labelClass} inputClass={inputClass} autoComplete="address-level2" />
        )}
        {shownWidgets.state === "select" ? (
          <SelectField
            label="Estado"
            labelClass={labelClass}
            inputClass={inputClass}
            value={values.state}
            options={[...UF_SIGLAS]}
            extra={UF_SIGLAS.includes(values.state as (typeof UF_SIGLAS)[number]) ? undefined : values.state}
            onChange={(uf) => {
              void chooseUf(uf);
            }}
          />
        ) : (
          <NamedField control={control} name={names.state} label="Estado" labelClass={labelClass} inputClass={inputClass} autoComplete="address-level1" />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  labelClass,
  error,
  children,
}: {
  label: string;
  labelClass?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass ?? "text-sm font-medium leading-none"}>{label}</label>
      {children}
      {error ? <span className="sr-only">{error}</span> : null}
    </div>
  );
}

function NamedField({
  control,
  name,
  label,
  labelClass,
  inputClass,
  autoComplete,
  maxLength,
}: {
  control: ReturnType<typeof useFormContext>["control"];
  name?: string;
  label: string;
  labelClass?: string;
  inputClass?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  if (!name) return null;
  return (
    <FormField
      control={control}
      name={name as FieldPath<FieldValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} className={inputClass} autoComplete={autoComplete} maxLength={maxLength} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  label,
  labelClass,
  inputClass,
  value,
  options,
  extra,
  onChange,
}: {
  label: string;
  labelClass?: string;
  inputClass?: string;
  value: string;
  options: string[];
  extra?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass ?? "text-sm font-medium leading-none"}>{label}</label>
      <select aria-label={label} className={inputClass ?? "flex h-10 w-full rounded-md border px-3 text-sm"} value={value} onChange={(event) => onChange(event.target.value)}>
        {extra ? <option value={extra}>{extra}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export { ADDRESS_LABELS };
