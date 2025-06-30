import { Organization, OrganizationWithVenueCount } from '@/types/organization';
import { OrganizationList } from './OrganizationList';
import { OrganizationCreateForm } from './OrganizationCreateForm';
import { AnimatedFormSwitcher } from '@/components/ui/animated-form-switcher';
import { EmptyState } from '@/components/ui/empty-state';

interface OrganizationSectionProps {
  organizations: OrganizationWithVenueCount[];
  userId?: string;
  isLoading: boolean;
  isCreating: boolean;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function OrganizationSection({
  organizations,
  userId,
  isLoading,
  isCreating,
  onCreateClick,
  onCancelCreate,
}: OrganizationSectionProps) {
  const showForm = isCreating;

  if (isLoading) {
    return <OrganizationList organizations={[]} isLoading={true} />;
  }

  if (!isLoading && organizations.length === 0 && !showForm) {
    return (
      <EmptyState
        title="Nenhuma organização encontrada"
        description="Crie sua primeira organização para começar a gerenciar seus espaços de eventos"
        action={{
          label: "Criar Organização",
          onClick: onCreateClick,
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <AnimatedFormSwitcher
        showForm={showForm}
        list={
          <OrganizationList
            organizations={organizations}
            isLoading={false}
          />
        }
        form={
          <div className="max-w-md mx-auto">
            <OrganizationCreateForm
              userId={userId || ''}
              onCancel={onCancelCreate}
              onSuccess={onCancelCreate}
            />
          </div>
        }
      />
    </div>
  );
} 