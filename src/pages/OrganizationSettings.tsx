import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Skeleton } from "@/components/ui/skeleton";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { FormLayout } from "@/components/ui/form-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useOrganizationStore } from "@/store/organizationStore";

const organizationSettingsSchema = z.object({
  name: z.string().min(2, "Nome da organização é obrigatório"),
});

type OrganizationSettingsFormValues = z.infer<typeof organizationSettingsSchema>;

export default function OrganizationSettings() {
  const { toast } = useToast();
  const { id: organizationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { currentOrganization, updateOrganizationById, deleteOrganization } = useOrganizationStore();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrganizationSettingsFormValues>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (currentOrganization) {
      form.reset({
        name: currentOrganization.name || "",
      });
    }
  }, [currentOrganization, form]);

  const onSubmit = async (data: OrganizationSettingsFormValues) => {
    setIsLoading(true);
    if (!organizationId || !user?.id) {
      console.log("organizationId ou user.id não encontrado");
      return;
    }

    try {
      const response = await updateOrganizationById(organizationId, { name: data.name });
      const { title, message } = handleBackendSuccess(
        response,
        "Configurações atualizadas com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar configurações. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      await deleteOrganization(organizationId);
      toast({
        title: "Sucesso",
        description: "Organização excluída com sucesso",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a organização",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações"
        subtitle="Gerencie as configurações da sua organização"
      >
        <div className="space-y-6 mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Configurações"
      subtitle="Gerencie as configurações da sua organização"
    >
      <FormLayout
        form={form}
        title="Informações Gerais"
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Salvar Alterações"
        isSubmitting={isLoading}
        isEditing={true}
        onDelete={handleDelete}
        entityName={currentOrganization?.name || ""}
        entityType="organização"
      >
        <div className="space-y-6">
          <div className="w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Organização</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </FormLayout>
    </DashboardLayout>
  );
} 