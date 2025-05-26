import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { useOrganizationStore } from "@/store/organizationStore";
import { useToast } from "@/components/ui/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

interface OrganizationCreateFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function OrganizationCreateForm({ userId, onSuccess, onCancel }: OrganizationCreateFormProps) {
  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });
  const { createOrganization } = useOrganizationStore();
  const { toast } = useToast();

  const handleSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      const response = await createOrganization({
        name: values.name,
        userId,
      });
      const { title, message } = handleBackendSuccess(response, "Organização criada com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      form.reset();
      if (onSuccess) onSuccess();
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao criar organização. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
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
        <DialogFooter className="flex flex-col gap-2">
          <AsyncActionButton
            type="submit"
            className="bg-eventhub-primary hover:bg-indigo-600 w-full"
            onClick={() => form.handleSubmit(handleSubmit)()}
            label="Criar"
          />
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="w-full"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 