import { Contact } from "@/types/contact";
import { partnerCategoryLabel } from "@/lib/partner-category";
import { ContactType } from "@/types/contact";
import { EmptyState } from "@/components/EmptyState";
import { ContactListSkeleton } from "./contact-list-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Phone } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface ContactListProps {
  contacts?: Contact[];
  isLoading: boolean;
  hasPermission: boolean;
  onCreateClick: () => void;
  onEditClick: (contact: Contact) => void;
  onDeleteClick: (contact: Contact) => Promise<void> | void;
}

export function ContactList({
  contacts,
  isLoading,
  hasPermission,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: ContactListProps) {
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const rows = contacts ?? [];
  const showCategory = rows.some((contact) => contact.type === ContactType.SUPPLIER);

  if (isLoading) {
    return <ContactListSkeleton />;
  }

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_CONTACTS");
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        hasEditPermission={hasEditPermission()}
        title="Nenhum contato encontrado"
        description="Os contatos do espaço serão exibidos aqui."
        actionText="Criar Contato"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <>
      <Table className="bg-white rounded-md shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            {showCategory && <TableHead>Categoria</TableHead>}
            <TableHead>Função</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((contact) => (
            <TableRow
              key={contact.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => hasEditPermission() && onEditClick(contact)}
            >
              <TableCell className="font-medium">{contact.name}</TableCell>
              {showCategory && (
                <TableCell>
                  {contact.type === ContactType.SUPPLIER ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {partnerCategoryLabel(contact.category)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </TableCell>
              )}
              <TableCell>
                {contact.type === ContactType.SUPPLIER ? (
                  contact.role ? (
                    <span className="text-sm text-gray-700">{contact.role}</span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )
                ) : (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {contact.role}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const whatsappNumber = (contact.whatsapp ?? "").replace(/\D/g, "");
                      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
                    }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Entrar em contato via WhatsApp"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  {hasPermission && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(contact);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar contato"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContactToDelete(contact);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remover contato"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDeleteDialog
        open={!!contactToDelete}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        onConfirm={async () => {
          if (!contactToDelete) return;
          await onDeleteClick(contactToDelete);
          setContactToDelete(null);
        }}
        entityName={contactToDelete?.name || ""}
        entityType="contato"
      />
    </>
  );
}
