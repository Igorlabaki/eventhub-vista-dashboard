import { Person, PersonType } from "@/types/person";
import { PersonList } from "./person-list";
import { PersonListSkeleton } from "./person-list-skeleton";
import { PersonForm } from "./person-form";
import { usePersonStore } from "@/store/personStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useUser } from "@/hooks/user/queries/byId";
import { CreatePersonDTO } from "@/types/person";
import { useEffect } from "react";

interface PersonSectionProps {
  type: PersonType;
  isCreating: boolean;
  selectedPerson: Person | null | undefined;
  setSelectedPerson: (person: Person | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  proposalId: string;
}

export function PersonSection({
  type,
  isCreating,
  selectedPerson,
  setSelectedPerson,
  onCreateClick,
  onCancelCreate,
  proposalId,
}: PersonSectionProps) {
  const {
    createPerson,
    updatePerson,
    deletePerson,
    persons,
    isLoading,
    fetchPersons,
  } = usePersonStore();
  const { toast } = useToast();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    if (user) {
      fetchPersons({ proposalId, type });
    }
  }, [user, type, fetchPersons, proposalId]);

  if (!user || isUserLoading) {
    return <PersonListSkeleton />;
  }

  const handleSubmit = async (data: {
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
  }) => {
    try {
      let response;
      if (selectedPerson) {
        response = await updatePerson({
          personId: selectedPerson.id,
          data: {
            name: data.data.name,
            email: data.data.email,
            rg: data.data.rg,
            type: data.data.type,
            attendance: data.data.attendance,
          },
        });
      } else {
        response = await createPerson({
          name: data.data.name,
          email: data.data.email,
          rg: data.data.rg,
          type: data.data.type,
          proposalId: data.proposalId,
          userId: data.userId,
          username: data.username,
        });
      }

      const { title, message } = handleBackendSuccess(
        response,
        "Pessoa salva com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchPersons({ proposalId, type });
      setSelectedPerson(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar pessoa."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePerson(id);
      await fetchPersons({ proposalId, type });
      setSelectedPerson(undefined);
      onCancelCreate();
      showSuccessToast({
        title: "Sucesso",
        description: "Pessoa excluída com sucesso!",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir pessoa. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedPerson(undefined);
    onCancelCreate();
  };

  const showForm = isCreating || !!selectedPerson;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <PersonListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <PersonList
              persons={persons}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedPerson}
              onDeletePerson={(person) => handleDelete(person.id)}
            />
          }
          form={
            <PersonForm
              person={selectedPerson}
              proposalId={proposalId}
              userId={user.id}
              username={user.username}
              type={type}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          }
        />
      )}
    </div>
  );
} 