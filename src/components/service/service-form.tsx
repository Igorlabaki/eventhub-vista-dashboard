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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service, ServicePricingType } from "@/types/service";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  pricingType: z.enum(["FIXED", "PER_HOUR", "PER_PERSON"]),
  description: z.string().max(500, "A descrição passa de 500 caracteres").optional(),
  rpaRequired: z.boolean().default(false),
  rpaMinPeople: z.number().optional(),
}).refine((data) => {
  if (data.rpaRequired && (!data.rpaMinPeople || data.rpaMinPeople < 1)) {
    return false;
  }
  return true;
}, {
  message: "Número mínimo de pessoas é obrigatório quando o serviço é obrigatório",
  path: ["rpaMinPeople"],
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
  onSubmit: (data: {
    name: string;
    price: number;
    pricingType: ServicePricingType;
    description?: string | null;
    file?: File;
    removeImage?: boolean;
    rpaRequired: boolean;
    rpaMinPeople?: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [removeImage, setRemoveImage] = useState(false);
  const { deleteService } = useServiceStore();
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name ?? "",
      price: service ? formatCurrency(service.price) : "",
      pricingType: service?.pricingType ?? "FIXED",
      description: service?.description ?? "",
      rpaRequired: service?.rpaRequired ?? false,
      rpaMinPeople: service?.rpaMinPeople,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: service?.name ?? "",
      price: service ? formatCurrency(service.price) : "",
      pricingType: service?.pricingType ?? "FIXED",
      description: service?.description ?? "",
      rpaRequired: service?.rpaRequired ?? false,
      rpaMinPeople: service?.rpaMinPeople,
    });
    setFile(undefined);
    setRemoveImage(false);
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
        pricingType: values.pricingType,
        description: values.description?.trim() ? values.description.trim() : null,
        file,
        removeImage,
        rpaRequired: values.rpaRequired,
        rpaMinPeople: values.rpaMinPeople ?? null,
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
      <FormField
        control={form.control}
        name="pricingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de preço</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="FIXED">Preço fixo</SelectItem>
                <SelectItem value="PER_HOUR">Por hora</SelectItem>
                <SelectItem value="PER_PERSON">Por pessoa</SelectItem>
              </SelectContent>
            </Select>
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
                placeholder="Texto opcional sobre o serviço"
                className="mt-1"
                maxLength={500}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <Label>Foto</Label>
        {service?.imageUrl && !removeImage && !file && (
          <img src={service.imageUrl} alt="" className="mt-2 h-24 w-40 rounded object-cover" />
        )}
        <Input
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={(event) => {
            setFile(event.target.files?.[0]);
            setRemoveImage(false);
          }}
        />
        {service?.imageUrl && (
          <button
            type="button"
            className="mt-2 text-sm text-gray-600 underline"
            onClick={() => {
              setRemoveImage((current) => !current);
              setFile(undefined);
            }}
          >
            {removeImage ? "Manter a foto atual" : "Remover foto"}
          </button>
        )}
      </div>
      <FormField
        control={form.control}
        name="rpaRequired"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Este serviço é obrigatório?</FormLabel>
            <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="false">Não</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("rpaRequired") && (
        <FormField
          control={form.control}
          name="rpaMinPeople"
          render={({ field }) => (
            <FormItem>
              <FormLabel>A partir de quantas pessoas este serviço é obrigatório?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Digite o número mínimo de pessoas"
                  className="mt-1"
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      field.onChange(undefined);
                    } else {
                      const numValue = Number(value);
                      if (numValue > 0) {
                        field.onChange(numValue);
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormLayout>
  );
} 