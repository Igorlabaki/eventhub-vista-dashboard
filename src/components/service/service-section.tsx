import { Service } from "@/types/service";
import { ServiceList } from "./service-list";
import { ServiceListSkeleton } from "./service-list-skeleton";
import { ServiceForm } from "./service-form";
import { useServiceStore } from "@/store/serviceStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface ServiceSectionProps {
  services: Service[];
  venueId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedService: Service | null | undefined;
  setSelectedService: (service: Service | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function ServiceSection({
  services,
  venueId,
  isLoading,
  isCreating,
  selectedService,
  setSelectedService,
  onCreateClick,
  onCancelCreate,
}: ServiceSectionProps) {
  const { createService, updateService } = useServiceStore();
  const { toast } = useToast();

  const handleSubmit = async (data: Partial<Service>) => {
    try {
      let response;
      if (selectedService) {
        response = await updateService({
          serviceId: selectedService.id,
          data: {
            name: data.name,
            price: data.price,
            rpaRequired: data.rpaRequired,
            rpaMinPeople: data.rpaMinPeople,
          },
        });
        const { title, message } = handleBackendSuccess(response, "Serviço atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createService({
          name: data.name,
          price: data.price,
          venueId,
          rpaRequired: data.rpaRequired,
          rpaMinPeople: data.rpaMinPeople,
        });
        const { title, message } = handleBackendSuccess(response, "Serviço criado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedService(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar serviço. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedService;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <ServiceListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <ServiceList
              services={services || []}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedService}
            />
          }
          form={
            <ServiceForm
              service={selectedService}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelectedService(undefined);
                onCancelCreate();
              }}
            />
          }
        />
      )}
    </div>
  );
} 