import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import { useServiceStore } from "@/store/serviceStore";
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
import { Service } from "@/types/service";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
});

type ServiceFormValues = z.infer<typeof formSchema>;

function formatCurrency(value: string | number) {
  const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, "")) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseCurrency(value: string) {
  return Number(value.replace(/\D/g, "")) / 100;
}

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: { name: string; price: number }) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteService } = useServiceStore();
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name ?? "",
      price: service ? formatCurrency(service.price) : "",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: service?.name ?? "",
      price: service ? formatCurrency(service.price) : "",
    });
  }, [service, form]);

  const handleDelete = async () => {
    if (!service) return;
    setIsDeleting(true);
    try {
      const response = await deleteService(service.id);
      const { title, message } = handleBackendSuccess(response, "Serviço excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir serviço. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const number = Number(rawValue) / 100;
    onChange(formatCurrency(number));
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        price: parseCurrency(values.price),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={service ? 'Editar Serviço' : 'Novo Serviço'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!service}
      onDelete={handleDelete}
      entityName={service?.name}
      entityType="serviço"
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
                placeholder="Digite o nome do serviço"
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
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço</FormLabel>
            <FormControl>
              <Input
                inputMode="numeric"
                placeholder="R$ 0,00"
                required
                className="mt-1"
                value={field.value}
                onChange={e => handleCurrencyChange(e, field.onChange)}
                maxLength={20}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 