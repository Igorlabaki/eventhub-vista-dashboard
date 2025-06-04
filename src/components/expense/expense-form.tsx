import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Expense, ExpenseType, ExpenseCategory, CreateExpenseDTO } from "@/types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { parseCurrencyStringToNumber } from "@/utils/currency";

const formSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    amount: z.string().min(1, "Valor é obrigatório"),
    paymentDate: z.string().optional(),
    type: z.nativeEnum(ExpenseType),
    category: z.nativeEnum(ExpenseCategory),
    recurring: z.boolean(),
    venueId: z.string().min(1, "Venue é obrigatória"),
  })
  .superRefine((data, ctx) => {
    if (!data.recurring && !data.paymentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de pagamento é obrigatória para despesas não recorrentes",
        path: ["paymentDate"],
      });
    }
  });

export type ExpenseFormValues = {
  name: string;
  description?: string;
  amount: string;
  paymentDate?: string;
  type: ExpenseType;
  category: ExpenseCategory;
  recurring: boolean;
  venueId: string;
};

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (data: CreateExpenseDTO) => Promise<void>;
  onCancel: () => void;
  venueId: string;
}

const expenseTypeOptions = [
  { value: ExpenseType.WEEKLY, display: "Semanal" },
  { value: ExpenseType.BIWEEKLY, display: "Quinzenal" },
  { value: ExpenseType.MONTHLY, display: "Mensal" },
  { value: ExpenseType.ANNUAL, display: "Anual" },
  { value: ExpenseType.SPORADIC, display: "Esporádica" },
];

const expenseCategoryOptions = [
  { value: ExpenseCategory.TAX, display: "Imposto" },
  { value: ExpenseCategory.INVESTMENT, display: "Investimento" },
  { value: ExpenseCategory.MAINTENANCE, display: "Manutenção" },
  { value: ExpenseCategory.ADVERTISING, display: "Publicidade" },
];

function formatCurrency(value: string | number) {
  const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, "")) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const handleCurrencyChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void
) => {
  const formatted = formatCurrency(e.target.value);
  onChange(formatted);
};

function parseCurrency(value: string) {
  return Number(value.replace(/\D/g, "")) / 100;
}

export function ExpenseForm({
  expense,
  onSubmit,
  onCancel,
  venueId,
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteExpense } = useExpenseStore();
  const { toast } = useToast();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: expense?.name ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ? formatCurrency(expense.amount) : "",
      paymentDate: expense?.paymentDate ?? "",
      type: expense?.type ?? ExpenseType.MONTHLY,
      category: expense?.category ?? ExpenseCategory.MAINTENANCE,
      recurring: expense?.recurring ?? false,
      venueId: venueId,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    form.reset({
      name: expense?.name ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ? formatCurrency(expense.amount) : "",
      paymentDate: expense?.paymentDate ?? "",
      type: expense?.type ?? ExpenseType.MONTHLY,
      category: expense?.category ?? ExpenseCategory.MAINTENANCE,
      recurring: expense?.recurring ?? false,
      venueId: venueId,
    });
  }, [expense, form, venueId]);

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Campo alterado:', name, value);
      if (form.formState.errors[name as keyof ExpenseFormValues]) {
        console.log('Erro no campo:', name, form.formState.errors[name as keyof ExpenseFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.errors]);

  const handleDelete = async () => {
    if (!expense) return;
    setIsDeleting(true);
    try {
      const response = await deleteExpense(expense.id, venueId);
      const { title, message } = handleBackendSuccess(
        response,
        "Despesa excluída com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir despesa. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        amount: parseCurrency(values.amount),
      });
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a despesa. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={expense ? "Editar Despesa" : "Nova Despesa"}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!expense}
      onDelete={handleDelete}
      entityName={expense?.name}
      entityType="despesa"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite o nome da despesa"
                required
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Digite a descrição da despesa"
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input
                value={field.value}
                onChange={(e) => handleCurrencyChange(e, field.onChange)}
                placeholder="R$ 0,00"
                required
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {expenseTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {expenseCategoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recurring"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Despesa Recorrente</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {!form.watch("recurring") && (
        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Pagamento</FormLabel>
              <FormControl>
                <Input type="date" className="mt-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormLayout>
  );
}
