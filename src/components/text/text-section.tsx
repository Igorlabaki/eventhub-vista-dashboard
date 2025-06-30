import { Text } from "@/types/text";
import { TextList } from "./text-list";
import { TextListSkeleton } from "./text-list-skeleton";
import { TextForm } from "./text-form";
import { useTextStore } from "@/store/textStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface TextSectionProps {
  texts: Text[];
  venueId?: string;
  organizationId?: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedText: Text | null | undefined;
  setSelectedText: (text: Text | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  type: "organization" | "venue";
}

export function TextSection({
  texts,
  venueId,
  organizationId,
  isLoading,
  isCreating,
  selectedText,
  setSelectedText,
  onCreateClick,
  onCancelCreate,
  type,
}: TextSectionProps) {
  const { createText, updateText, createTextOrganization, updateTextOrganization } = useTextStore();
  const { toast } = useToast();

  const handleSubmit = async (data: { area: string; title?: string; position: number; text: string }) => {
    try {
      let response;
      if (selectedText) {
        if (type === "organization" && organizationId) {
          response = await updateTextOrganization({
            textId: selectedText.id,
            organziationId: organizationId,
            data: {
              area: data.area,
              title: data.title,
              position: data.position,
              text: data.text,
            },
          });
        } else if (type === "venue" && venueId) {
          response = await updateText({
            textId: selectedText.id,
            venueId,
            data: {
              area: data.area,
              title: data.title,
              position: data.position,
              text: data.text,
            },
          });
        }
        const { title, message } = handleBackendSuccess(response, "Texto atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        if (type === "organization" && organizationId) {
          response = await createTextOrganization({
            area: data.area,
            title: data.title,
            position: data.position,
            text: data.text,
            organizationId,
          });
        } else if (type === "venue" && venueId) {
          response = await createText({
            area: data.area,
            title: data.title,
            position: data.position,
            text: data.text,
            venueId,
          });
        }
        const { title, message } = handleBackendSuccess(response, "Texto criado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedText(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar texto. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedText;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <TextListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <TextList
              texts={texts || []}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedText}
            />
          }
          form={
            <TextForm
              text={selectedText}
              venueId={venueId}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelectedText(undefined);
                onCancelCreate();
              }}
            />
          }
        />
      )}
    </div>
  );
} 