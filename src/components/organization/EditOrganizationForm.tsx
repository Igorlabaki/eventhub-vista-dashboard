import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

const editOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;

interface EditOrganizationFormProps {
  initialName: string;
  onSubmit: (values: EditOrganizationFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function EditOrganizationForm({
  initialName,
  onSubmit,
  onCancel,
  isPending = false,
}: EditOrganizationFormProps) {
  const form = useForm<EditOrganizationFormValues>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      name: initialName,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Organização</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="Digite o nome da organização"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <SubmitButton
            type="submit"
            className="flex-1"
            loading={isPending}
          >
            Salvar
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
} 