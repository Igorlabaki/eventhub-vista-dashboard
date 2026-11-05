import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { publicLabelClass } from "@/components/proposal/public-list-pattern";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import InputMask from "react-input-mask";

export function ContractPublicField<T extends FieldValues>({
  control,
  name,
  label,
  inputClassName,
  type,
  placeholder,
  maxLength,
  mask,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  inputClassName: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  mask?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={publicLabelClass}>{label}</FormLabel>
          <FormControl>
            {mask ? (
              <InputMask
                mask={mask}
                placeholder={placeholder}
                value={field.value ?? ""}
                onChange={field.onChange}
              >
                {(inputProps) => <input {...inputProps} className={inputClassName} />}
              </InputMask>
            ) : (
              <input
                {...field}
                value={field.value ?? ""}
                type={type}
                placeholder={placeholder}
                maxLength={maxLength}
                className={inputClassName}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
