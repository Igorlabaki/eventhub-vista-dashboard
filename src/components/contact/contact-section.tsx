import { Contact, ContactType } from "@/types/contact";

import { useContactStore } from "@/store/contactStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { EmptyState } from "@/components/EmptyState";
import { ContactListSkeleton } from "./contact-list-skeleton";
import { ContactList } from "./contact-list";
import { ContactForm } from "./contact-form";

interface ContactSectionProps {
  contacts?: Contact[];
  venueId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedContact: Contact | null | undefined;
  setSelectedContact: (contact: Contact | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function ContactSection({
  contacts,
  venueId,
  isLoading,
  isCreating,
  selectedContact,
  setSelectedContact,
  onCreateClick,
  onCancelCreate,
}: ContactSectionProps) {
  const { createContact, updateContact } = useContactStore();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    name: string;
    role: string;
    whatsapp: string;
    email?: string;
    type?: ContactType;
  }) => {
    try {
      let response;
      if (selectedContact) {
        response = await updateContact(selectedContact.id, {
          ...data,
          venueId,
        });
        const { title, message } = handleBackendSuccess(response, "Contato atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createContact({
          ...data,
          venueId,
        });
        const { title, message } = handleBackendSuccess(response, "Contato criado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedContact(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar contato. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedContact;

  return (
    <div className="animate-fade-in">
      <AnimatedFormSwitcher
        showForm={showForm}
        list={
          <ContactList
            contacts={contacts}
            isLoading={isLoading}
            onCreateClick={onCreateClick}
            onEditClick={setSelectedContact}
          />
        }
        form={
          <ContactForm
            contact={selectedContact}
            onSubmit={handleSubmit}
            onCancel={() => {
              setSelectedContact(undefined);
              onCancelCreate();
            }}
          />
        }
      />
    </div>
  );
} 