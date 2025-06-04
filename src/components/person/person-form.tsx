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
import { Person, PersonType } from "@/types/person";
import { Checkbox } from "@/components/ui/checkbox";

interface PersonFormProps {
  person?: Person | null;
  proposalId: string;
  userId: string;
  username: string;
  type: PersonType;
  onSubmit: (data: {
    userId: string;
    username: string;
    proposalId: string;
    personId?: string;
    data: {
      name: string;
      email?: string;
      rg?: string;
      attendance: boolean;
      type: PersonType;
    };
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

type PersonFormValues = {
  name: string;
  email?: string;
  rg?: string;
  attendance: boolean;
  type: PersonType;
};

export function PersonForm({ 
  person, 
  proposalId, 
  userId, 
  username, 
  type,
  onSubmit, 
  onDelete, 
  onCancel 
}: PersonFormProps) {
  const isEditing = !!person;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    rg: z.string().optional(),
    attendance: z.boolean().default(false),
    type: z.nativeEnum(PersonType),
  });

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: person?.name || "",
      email: person?.email || "",
      rg: person?.rg || "",
      attendance: person?.attendance || false,
      type: person?.type || type,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: person?.name || "",
      email: person?.email || "",
      rg: person?.rg || "",
      attendance: person?.attendance || false,
      type: person?.type || type,
    });
  }, [person, form, type]);

  const handleDelete = async () => {
    if (!person) return;
    setIsDeleting(true);
    try {
      await onDelete(person.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: PersonFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        username,
        proposalId,
        ...(isEditing && person ? { personId: person.id } : {}),
        data: {
          name: values.name,
          email: values.email,
          rg: values.rg,
          attendance: values.attendance,
          type: values.type,
        }
      };

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <FormLayout
      form={form}
      title={person ? 'Editar Pessoa' : 'Nova Pessoa'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      isEditing={!!person}
      onDelete={handleDelete}
      entityName={`Pessoa ${person?.name}`}
      entityType="pessoa"
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
                type="text"
                placeholder="Digite o nome"
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Digite o email"
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
        name="rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RG</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Digite o RG"
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
        name="attendance"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Confirmar Presença
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </FormLayout>
  );
}

export default PersonForm; 