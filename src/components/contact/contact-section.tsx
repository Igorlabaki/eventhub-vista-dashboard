import { ReactNode } from "react";
import { Contact, ContactType, PartnerCategory } from "@/types/contact";

import { useContactStore } from "@/store/contactStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ContactList } from "./contact-list";
import { ContactForm } from "./contact-form";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface ContactSectionProps {
  contacts?: Contact[];
  venueId: string;
  isLoading: boolean;
  isCreating: boolean;
  hasPermission: boolean;
  selectedContact: Contact | null | undefined;
  setSelectedContact: (contact: Contact | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  listHeader?: ReactNode;
  listFooter?: ReactNode;
}

export function ContactSection({
  contacts,
  venueId,
  isLoading,
  isCreating,
  hasPermission,
  selectedContact,
  setSelectedContact,
  onCreateClick,
  onCancelCreate,
  listHeader,
  listFooter,
}: ContactSectionProps) {
  const { createContact, updateContact, deleteContact } = useContactStore();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    name?: string;
    role?: string;
    whatsapp?: string;
    email?: string;
    type?: ContactType;
    category?: PartnerCategory;
    description?: string;
  }, extra?: { file?: File; removeLogo?: boolean }) => {
    try {
      let response;
      if (selectedContact) {
        response = await updateContact(selectedContact.id, {
          ...data,
          email: data.email || undefined,
          description: data.type === ContactType.SUPPLIER ? data.description : undefined,
          removeLogo: extra?.removeLogo,
          venueId,
        }, extra?.file);
        const { title, message } = handleBackendSuccess(response, "Contato atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createContact({
          ...data,
          description: data.type === ContactType.SUPPLIER ? data.description : undefined,
          venueId,
        }, extra?.file);
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
          <>
            {listHeader}
            <ContactList
              hasPermission={hasPermission}
              contacts={contacts}
              isLoading={isLoading}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedContact}
              onDeleteClick={(contact) => deleteContact(contact.id, venueId)}
            />
            {listFooter}
          </>
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