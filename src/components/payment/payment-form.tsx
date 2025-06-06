import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Payment, PaymentMethod } from "@/types/payment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { CreatePaymentWithFileDTO } from "@/services/payment.service";

interface PaymentFormProps {
  payment?: Payment | null;
  proposalId: string;
  venueId: string;
  userId: string;
  username: string;
  onSubmit: (data: CreatePaymentWithFileDTO) => Promise<void>;
  onUpdate: (data: CreatePaymentWithFileDTO & { paymentId: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
  totalPaid: number;
  totalAmount: number;
}

type PaymentFormValues = {
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  file?: File | null;
};

function parseCurrencyStringToNumber(value: string): number {
  let sanitized = value.replace(/R\$|\s|\./g, '');
  sanitized = sanitized.replace(',', '.');
  sanitized = sanitized.replace(/[^0-9.]/g, '');
  return Number(sanitized) || 0;
}

function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = Number(numbers) / 100;
  return `R$ ${amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDateToSlash(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function PaymentForm({ payment, proposalId, venueId, userId, username, onSubmit, onUpdate, onDelete, onCancel, totalPaid, totalAmount }: PaymentFormProps) {
  const isEditing = !!payment;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(payment?.imageUrl || null);

  const remaining = Math.max(totalAmount - totalPaid, 0);

  const formSchema = z.object({
    amount: z
      .string()
      .min(1, "Valor deve ser maior que zero")
      .refine((val) => {
        if (isEditing) return true;
        return parseCurrencyStringToNumber(val) > 0;
      }, "Valor deve ser maior que zero")
      .refine((val) => {
        if (isEditing) return true;
        return parseCurrencyStringToNumber(val) <= remaining;
      }, { message: `O valor não pode ser maior que o restante a pagar (${formatCurrency(remaining)})` }),
    paymentDate: z.string().min(1, "Data é obrigatória"),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      required_error: "Método de pagamento é obrigatório",
    }),
    file: z.any().optional(),
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: payment?.amount ? formatCurrency(payment.amount) : '',
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : "",
      paymentMethod: payment?.paymentMethod ?? undefined,
      file: null,
    },
  });

  React.useEffect(() => {
    form.reset({
      amount: payment?.amount ? formatCurrency(payment.amount) : '',
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : "",
      paymentMethod: payment?.paymentMethod ?? undefined,
      file: null,
    });
    setPreview(payment?.imageUrl || null);
  }, [payment, form]);

  const handleDelete = async () => {
    if (!payment) return;
    setIsDeleting(true);
    try {
      await onDelete(payment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    } else {
      setPreview(payment?.imageUrl || null);
      onChange(null);
    }
  };

  const handleSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreatePaymentWithFileDTO = {
        ...values,
        amount: parseCurrencyStringToNumber(values.amount),
        file: values.file,
        userId,
        username,
        venueId,
        proposalId,
        paymentDate: formatDateToSlash(values.paymentDate),
      };

      if (payment) {
        await onUpdate({ ...payload, paymentId: payment.id });
      } else {
        await onSubmit(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setPreview(null);
    onCancel();
  };
  console.log("values", payment?.imageUrl)
  return (
    <FormLayout
      form={form}
      title={payment ? 'Editar Pagamento' : 'Novo Pagamento'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      isEditing={!!payment}
      onDelete={handleDelete}
      entityName={`Pagamento de R$ ${payment?.amount?.toFixed(2)}`}
      entityType="pagamento"
      isDeleting={isDeleting}
    >
      {/* Exibir totais */}
      <div className="mb-4 flex flex-col gap-1 text-sm">
        <span><b>Total já pago:</b> <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span></span>
        <span><b>Restante a pagar:</b> <span className="font-semibold text-red-600">{formatCurrency(remaining)}</span></span>
      </div>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                required
                className="mt-1"
                value={field.value}
                onChange={(e) => field.onChange(formatCurrencyInput(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paymentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data do Pagamento</FormLabel>
            <FormControl>
              <Input
                type="date"
                placeholder="Selecione a data"
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
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Método de Pagamento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={PaymentMethod.PIX}>PIX</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo de upload de comprovante */}
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comprovante (opcional)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, field.onChange)}
              />
            </FormControl>
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Comprovante"
                  className="max-h-40 rounded border shadow"
                  style={{ cursor: 'pointer' }}
                  onClick={() => window.open(preview, '_blank')}
                />
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 