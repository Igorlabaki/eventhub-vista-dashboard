import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SERVICE_HOURS_MESSAGE, serviceHourFieldError } from "@/lib/event-duration";
import { hourlyChoiceAmount } from "@/lib/service-price-label";
import { courtesyLabel } from "@/lib/service-courtesy";
import { discountRemovedNotice } from "@/lib/proposal-discount";
import { proposalService, PublicServiceChoice } from "@/services/proposal.service";

const CONFIRMED_MESSAGE = "Este orçamento já foi confirmado e não pode ser alterado.";
const FALLBACK_MESSAGE = "Não foi possível atualizar os serviços. Tente de novo.";

type UpdateProposalServicesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  approved: boolean;
  paid: boolean;
  choices: PublicServiceChoice[];
  hourlyRates?: Record<string, number>;
  eventHours: number;
  loadFailed: boolean;
  discountPercent?: number;
  onSaved: (
    data: Awaited<ReturnType<typeof proposalService.updatePublicProposalServices>>["data"],
    serviceHours: { serviceId: string; hours: number }[],
  ) => void;
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function requiredText(minPeople: number | null) {
  if (minPeople == null) return "Obrigatório.";
  if (minPeople === 1) return "Obrigatório a partir de 1 pessoa.";
  return `Obrigatório a partir de ${minPeople} pessoas.`;
}

function appliedCourtesyHours(choice: PublicServiceChoice, rawHours: string) {
  const courtesy = choice.courtesyQuantity ?? 0;
  const hours = Number(rawHours.trim());
  if (!Number.isInteger(hours) || hours < 1) return courtesy;
  return Math.min(courtesy, hours);
}

function courtesyNote(choice: PublicServiceChoice, rate: number | undefined, rawHours: string) {
  if ((choice.courtesyQuantity ?? 0) <= 0) return null;
  if (!choice.hourly) return courtesyLabel({ courtesyQuantity: choice.courtesyQuantity }, choice.courtesyAmount ?? 0);
  const hours = appliedCourtesyHours(choice, rawHours);
  const amount = typeof rate === "number" ? rate * hours : choice.courtesyAmount ?? 0;
  return courtesyLabel({ pricingType: "PER_HOUR", courtesyQuantity: hours }, amount);
}

function messageFrom(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return FALLBACK_MESSAGE;
}

export function UpdateProposalServicesDialog({
  open,
  onOpenChange,
  proposalId,
  approved,
  paid,
  choices,
  hourlyRates,
  eventHours,
  loadFailed,
  discountPercent,
  onSaved,
}: UpdateProposalServicesDialogProps) {
  const discountNotice = discountRemovedNotice(discountPercent);
  const [selected, setSelected] = useState<string[]>([]);
  const [hoursInput, setHoursInput] = useState<Record<string, string>>({});
  const [hourErrors, setHourErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saving = useRef(false);
  const seeded = useRef(false);
  const blocked = approved || paid ? CONFIRMED_MESSAGE : null;

  useEffect(() => {
    if (!open) {
      seeded.current = false;
      return;
    }
    if (seeded.current || (choices.length === 0 && !loadFailed)) return;
    seeded.current = true;
    setSelected(choices.filter((choice) => choice.selected || choice.required).map((choice) => choice.id));
    const seededHours = Object.fromEntries(
      choices
        .filter((choice) => choice.hourly && typeof choice.hours === "number")
        .map((choice) => [choice.id, String(choice.hours)]),
    );
    setHoursInput(seededHours);
    setHourErrors(Object.fromEntries(
      Object.entries(seededHours).flatMap(([id, value]) => {
        const message = serviceHourFieldError(value, eventHours);
        return message ? [[id, message]] : [];
      }),
    ));
    setError(loadFailed ? FALLBACK_MESSAGE : null);
    setSubmitting(false);
  }, [open, choices, loadFailed, eventHours]);

  async function confirm() {
    if (saving.current || blocked || loadFailed) return;
    const serviceIds = choices
      .filter((choice) => choice.required || selected.includes(choice.id))
      .map((choice) => choice.id);
    const hourlyChosen = choices.filter((choice) => choice.hourly && serviceIds.includes(choice.id));
    const nextErrors: Record<string, string> = {};
    const serviceHours = hourlyChosen.flatMap((choice) => {
      const raw = (hoursInput[choice.id] ?? "").trim();
      const message = serviceHourFieldError(raw, eventHours);
      if (!raw || message) {
        nextErrors[choice.id] = message ?? SERVICE_HOURS_MESSAGE;
        return [];
      }
      return [{ serviceId: choice.id, hours: Number(raw) }];
    });
    if (Object.keys(nextErrors).length > 0) {
      setHourErrors(nextErrors);
      return;
    }
    saving.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const response = await proposalService.updatePublicProposalServices(proposalId, serviceIds, serviceHours);
      onSaved(response.data, serviceHours);
      onOpenChange(false);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      saving.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground" aria-describedby="update-proposal-services-description">
        <DialogTitle>Alterar serviços</DialogTitle>
        <DialogDescription id="update-proposal-services-description">
          Marque os serviços deste evento. O valor é atualizado ao confirmar.
        </DialogDescription>
        {discountNotice && !blocked && <p className="text-sm text-amber-700">{discountNotice}</p>}
        {blocked && <p role="alert" className="text-sm text-red-600">{blocked}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="mt-2 flex max-h-80 flex-col gap-3 overflow-y-auto">
          {choices.length === 0 && !loadFailed && (
            <p className="text-sm opacity-70">Nenhum serviço disponível.</p>
          )}
          {choices.map((choice) => {
            const checked = choice.required || selected.includes(choice.id);
            const asksHours = Boolean(choice.hourly) && checked;
            const rawHours = hoursInput[choice.id] ?? "";
            const shownAmount = choice.hourly
              ? (asksHours
                ? hourlyChoiceAmount(hourlyRates?.[choice.id], rawHours, eventHours, appliedCourtesyHours(choice, rawHours))
                : null)
              : choice.amount;
            const courtesy = checked ? courtesyNote(choice, hourlyRates?.[choice.id], rawHours) : null;
            return (
              <div key={choice.id} className="flex items-center justify-between gap-3">
              <label className="flex min-w-0 flex-1 items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={checked}
                  disabled={Boolean(blocked) || submitting || choice.required}
                  onChange={(event) => {
                    if (choice.required || blocked || submitting) return;
                    setSelected((current) => (
                      event.target.checked
                        ? [...current, choice.id]
                        : current.filter((id) => id !== choice.id)
                    ));
                    if (!event.target.checked) {
                      setHoursInput((current) => {
                        const next = { ...current };
                        delete next[choice.id];
                        return next;
                      });
                      setHourErrors((current) => {
                        const next = { ...current };
                        delete next[choice.id];
                        return next;
                      });
                    }
                  }}
                />
                <span className="min-w-0 text-sm">
                  <span className={choice.required ? "font-medium" : undefined}>{choice.name}</span>
                  {shownAmount != null && (
                    <span className="ml-2 text-xs opacity-70">{money(shownAmount)}</span>
                  )}
                  {choice.required && (
                    <span className="mt-1 block text-xs opacity-70">{requiredText(choice.minPeople)}</span>
                  )}
                  {courtesy && <span className="mt-1 block text-xs opacity-70">{courtesy}</span>}
                </span>
              </label>
              {asksHours && (
                <div className="flex w-44 shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`public-service-hours-${choice.id}`} className="whitespace-nowrap text-xs">
                      Quantas horas?
                    </label>
                    <input
                      id={`public-service-hours-${choice.id}`}
                      type="text"
                      inputMode="numeric"
                      disabled={Boolean(blocked) || submitting}
                      className="h-9 w-14 rounded-md border bg-transparent px-2 text-sm"
                      value={hoursInput[choice.id] ?? ""}
                      aria-invalid={Boolean(hourErrors[choice.id])}
                      onChange={(event) => {
                        const value = event.target.value;
                        setHoursInput((current) => ({ ...current, [choice.id]: value }));
                        setHourErrors((current) => {
                          const next = { ...current };
                          const message = serviceHourFieldError(value, eventHours);
                          if (message) next[choice.id] = message;
                          else delete next[choice.id];
                          return next;
                        });
                      }}
                    />
                  </div>
                  {hourErrors[choice.id] && (
                    <p role="alert" className="text-right text-xs text-red-600">{hourErrors[choice.id]}</p>
                  )}
                </div>
              )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          disabled={Boolean(blocked) || submitting || loadFailed}
          onClick={() => void confirm()}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Confirmando..." : "Confirmar"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
