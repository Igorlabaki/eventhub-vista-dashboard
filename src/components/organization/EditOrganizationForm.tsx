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
import { useOrganizationStore } from "@/store/organizationStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const editOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;

interface EditOrganizationFormProps {
  organizationId: string;
  initialName: string;
  onCancel: () => void;
}

export function EditOrganizationForm({
  organizationId,
  initialName,
  onCancel,
}: EditOrganizationFormProps) {
  const { updateOrganizationById, isLoading } = useOrganizationStore();
  const { toast } = useToast();

  const form = useForm<EditOrganizationFormValues>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleSubmit = async (values: EditOrganizationFormValues) => {
    try {
      const response = await updateOrganizationById(organizationId, { name: values.name });
      const { title, message } = handleBackendSuccess(response, "Organização atualizada com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar organização. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            loading={isLoading}
          >
            Salvar
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
} 