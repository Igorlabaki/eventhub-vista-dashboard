import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useGoalStore } from "@/store/goalStore";
import { toast } from "@/components/ui/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { monthsList } from "./GoalsTab";
import { useVenueStore } from "@/store/venueStore";

const formSchema = z.object({
  minValue: z.string().min(1, "Obrigatório"),
  maxValue: z.string().default(""),
  increasePercent: z.string().min(1, "Obrigatório"),
  months: z.array(z.string()).default([]),
});

type GoalFormValues = z.infer<typeof formSchema>;

interface Goal {
  id: string;
  minValue: number;
  maxValue?: number;
  increasePercent: number;
  months: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalFormProps {
  goal?: Goal | null;
  onCancel: () => void;
}

export function GoalForm({ goal, onCancel }: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { createGoal, updateGoal, deleteGoal } = useGoalStore();
  const { selectedVenue: venue } = useVenueStore();
  const monthLabels = monthsList.map(m => m.display);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: goal ? {
      minValue: goal.minValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      maxValue: goal.maxValue !== undefined && goal.maxValue !== null
        ? goal.maxValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "",
      increasePercent: goal.increasePercent.toString(),
      months: goal.months
        .split(',')
        .map(m => {
          const found = monthsList.find(month => month.value === m.trim());
          return found ? found.display : m;
        })
        .filter(Boolean),
    } : {
      minValue: "",
      maxValue: "",
      increasePercent: "",
      months: [],
    },
  });

  React.useEffect(() => {
    form.reset(goal ? {
      minValue: goal.minValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      maxValue: goal.maxValue !== undefined && goal.maxValue !== null
        ? goal.maxValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "",
      increasePercent: goal.increasePercent.toString(),
      months: goal.months
        .split(',')
        .map(m => {
          const found = monthsList.find(month => month.value === m.trim());
          return found ? found.display : m;
        })
        .filter(Boolean),
    } : {
      minValue: "",
      maxValue: "",
      increasePercent: "",
      months: [],
    });
  }, [goal]);

  const handleDelete = async () => {
    if (!goal) return;
    setIsDeleting(true);
    try {
      const response = await deleteGoal(goal.id);
      const { title, message } = handleBackendSuccess(response, "Meta excluída com sucesso!");
      showSuccessToast({ title, description: message });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir meta. Tente novamente mais tarde.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  function parseCurrencyStringToNumberString(value: string): string {
    // Remove R$, espaços e pontos de milhar
    let sanitized = value.replace(/R\$|\s|\./g, '');
    // Troca vírgula decimal por ponto
    sanitized = sanitized.replace(',', '.');
    // Remove qualquer caractere não numérico exceto ponto
    sanitized = sanitized.replace(/[^0-9.]/g, '');
    return sanitized;
  }

  function asReais(value: string): string {
    return parseCurrencyStringToNumberString(value);
  }

  const handleFormSubmit = async (values: GoalFormValues) => {
    setIsSubmitting(true);
    try {
      const monthsAsNumbers = values.months.map((m: string) => {
        const found = monthsList.find(month => month.display === m || month.value === m);
        return found ? found.value : m;
      });
      const payload = {
        minValue: asReais(values.minValue),
        maxValue: values.maxValue ? asReais(values.maxValue) : undefined,
        increasePercent: values.increasePercent,
        months: monthsAsNumbers,
        venueId: venue.id,
      };
      if (goal) {
        const response = await updateGoal({
          goalId: goal.id,
          venueId: venue.id,
          data: {
            minValue: Number(asReais(values.minValue)),
            maxValue: values.maxValue ? Number(asReais(values.maxValue)) : undefined,
            increasePercent: Number(values.increasePercent),
            months: monthsAsNumbers.join(","),
          },
        });
        const { title, message } = handleBackendSuccess(response, "Meta atualizada com sucesso!");
        showSuccessToast({ title, description: message });
      } else {
        const response = await createGoal(payload);
        const { title, message } = handleBackendSuccess(response, "Meta criada com sucesso!");
        showSuccessToast({ title, description: message });
      }
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar meta. Tente novamente mais tarde.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = Number(numbers) / 100;
    return `R$ ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatCurrency(e.target.value);
    onChange(formatted);
  };

  return (
    <FormLayout
      form={form}
      title={goal ? 'Editar Meta' : 'Nova Meta'}
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!goal}
      onDelete={goal ? handleDelete : undefined}
      entityName={goal?.minValue?.toString()}
      entityType="meta"
      isDeleting={isDeleting}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Mínimo (R$)*</FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={(e) => handleCurrencyChange(e, field.onChange)}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Máximo (R$)</FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={(e) => handleCurrencyChange(e, field.onChange)}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="increasePercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Aumento (%)*</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0%" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="months"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selecione os Meses</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                {monthLabels.map((month) => (
                  <div key={month} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-month-${month}`}
                      checked={field.value?.includes(month) || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), month]);
                        } else {
                          field.onChange(
                            (field.value || []).filter((m: string) => m !== month)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`goal-month-${month}`} className="text-sm">
                      {month}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormLayout>
  );
} 