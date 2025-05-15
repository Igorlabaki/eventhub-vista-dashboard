import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrganizationCard } from "@/components/organization/OrganizationCard";
import { Plus, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/user/queries/byId";
import { useGetOrganizationsList } from "@/hooks/organization/queries/list";
import { useCreateOrganizationMutations } from "@/hooks/organization/mutations/create";
import { OrganizationCardSkeleton } from "@/components/organization/OrganizationCardSkeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import { SearchFilterListByQueries } from "@/components/SearchFilterListByQueries";
import { FilterList } from "@/components/filterList";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  const { data: user } = useUser();

  const {
    data: organizations = [],
    isLoading,
    error,
  } = useGetOrganizationsList(user?.id);

  const { createOrganization } = useCreateOrganizationMutations(user?.id);

  const handleCreateOrganization = (values: CreateOrganizationFormValues) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }
    createOrganization.mutate(
      { name: values.name, userId: user.id },
      {
        onSuccess: () => {
          form.reset();
          setDialogOpen(false);
        },
      }
    );
  };
  return (
    <DashboardLayout title="Organizações" subtitle="Gerencie suas organizações">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Building className="h-5 w-5 text-eventhub-primary" />
          Suas Organizações ({organizations.length})
        </h2>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-eventhub-primary hover:bg-indigo-600"
        >
          <Plus className="hidden md:block h-4 w-4 mr-2 text-sm md:text-base" />
          Nova Organização
        </Button>
      </div>
      <FilterList
        items={organizations}
        filterBy={(org, query) =>
          org.name.toLowerCase().includes(query.toLowerCase())
        }
        placeholder="Buscar organização..."
      >
        {(filtered) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <OrganizationCardSkeleton key={i} />
                ))
              : filtered.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    id={org.id}
                    name={org.name}
                    venueCount={0}
                    newBudgetsCount={0}
                  />
                ))}
          </div>
        )}
      </FilterList>
      {/* Dialog para criar nova organização */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[80%] md:max-w-[40%] rounded-md">
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
            <DialogDescription>
              Crie uma nova organização para gerenciar seus espaços de eventos
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateOrganization)}
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
                <SubmitButton
                  type="submit"
                  className="bg-eventhub-primary hover:bg-indigo-600 w-full"
                  loading={createOrganization.isPending}
                >
                  Criar
                </SubmitButton>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
