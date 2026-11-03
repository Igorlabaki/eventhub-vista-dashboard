import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValid, parse } from "date-fns";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { MinimumPricePeriod } from "@/types/minimumPricePeriod";
import { useMinimumPricePeriodStore } from "@/store/minimumPricePeriodStore";

const dayMonth = z.string().refine((value) => {
  const parsed = parse(value, "dd/MM", new Date(2000, 0, 1));
  return isValid(parsed)
    && parsed.getDate() === Number(value.slice(0, 2))
    && parsed.getMonth() + 1 === Number(value.slice(3, 5));
}, "Use uma data válida no formato dd/mm");

const formSchema = z.object({
  title: z.string().trim().min(1, "Obrigatório"),
  startDay: dayMonth,
  endDay: dayMonth,
  price: z.string().min(1, "Obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(value: string | number) {
  const number = typeof value === "number" ? value : Number(value.replace(/\D/g, "")) / 100;
  return number ? `R$ ${number.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "";
}

function parseCurrency(value: string) {
  const sanitized = value.replace(/R\$|\s|\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  return Number(sanitized);
}

interface MinimumPriceFormProps {
  period?: MinimumPricePeriod | null;
  venueId: string;
  onCancel: () => void;
  onDelete?: () => void;
}

export function MinimumPriceForm({ period, venueId, onCancel, onDelete }: MinimumPriceFormProps) {
  const { createPeriod, updatePeriod } = useMinimumPricePeriodStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: period?.title || "",
      startDay: period?.startDay || "",
      endDay: period?.endDay || "",
      price: period ? formatCurrency(period.price) : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const price = parseCurrency(values.price);
    if (!price || price <= 0) {
      form.setError("price", { message: "Informe um valor maior que zero" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title.trim(),
        startDay: values.startDay,
        endDay: values.endDay,
        price,
      };
      const response = period
        ? await updatePeriod({ id: period.id, ...payload })
        : await createPeriod({ venueId, ...payload });
      const { title, message } = handleBackendSuccess(
        response,
        period ? "Faixa atualizada com sucesso!" : "Faixa criada com sucesso!",
      );
      showSuccessToast({ title, description: message });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar a faixa. Tente novamente.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={period ? "Editar faixa" : "Nova faixa"}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!period}
      onDelete={period ? onDelete : undefined}
      entityName={period?.title}
      entityType="faixa de preço mínimo"
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input placeholder="Dezembro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início*</FormLabel>
                <FormControl>
                  <Input placeholder="01/12" inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim*</FormLabel>
                <FormControl>
                  <Input placeholder="31/12" inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço mínimo (R$)*</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={field.value}
                  onChange={(event) => field.onChange(formatCurrency(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormLayout>
  );
}
