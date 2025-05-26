import { Contact, ContactType } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ContactListSkeleton } from "./contact-list-skeleton";
import { FilterList } from "@/components/filterList";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onCreateClick: () => void;
  onEditClick: (contact: Contact) => void;
  onDeleteClick?: (contact: Contact) => void;
}

export function ContactList({ contacts, isLoading, onCreateClick, onEditClick, onDeleteClick }: ContactListProps) {
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  if (isLoading) {
    return <ContactListSkeleton />;
  }

  return (
    <>
      <FilterList
        items={contacts}
        filterBy={(contact, query) =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.role.toLowerCase().includes(query.toLowerCase()) ||
          contact.whatsapp.toLowerCase().includes(query.toLowerCase()) ||
          (contact.email?.toLowerCase().includes(query.toLowerCase()) ?? false)
        }
        placeholder="Buscar contatos..."
      >
        {(filteredContacts) =>
          filteredContacts.length === 0 ? (
            <EmptyState
              title="Nenhum contato encontrado"
              description="Os contatos do espaço serão exibidos aqui."
              actionText="Criar Contato"
              onAction={onCreateClick}
            />
          ) : (
            <Table className="bg-white rounded-md shadow-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onEditClick(contact)}
                  >
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full
                          ${contact.type === ContactType.TEAM_MEMBER
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"}
                        `}
                      >
                        {contact.role}
                      </span>
                    </TableCell>
                    <TableCell>{contact.whatsapp}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); onEditClick(contact); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Editar contato"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setContactToDelete(contact); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Remover contato"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }
      </FilterList>
      <ConfirmDeleteDialog
        open={!!contactToDelete}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        onConfirm={async () => {
          if (contactToDelete && onDeleteClick) {
            await onDeleteClick(contactToDelete);
            setContactToDelete(null);
          }
        }}
        entityName={contactToDelete?.name || ""}
        entityType="contato"
      />
    </>
  );
} 