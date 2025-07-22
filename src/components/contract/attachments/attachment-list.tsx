import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { FilterList } from "@/components/filterList";
import { Pencil, Trash2 } from "lucide-react";
import { Attachment } from "@/types/attachment";
import { useAttachmentStore } from "@/store/attachmentStore";
import { AttachmentListSkeleton } from "./attachment-skeleton";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";

interface AttachmentListProps {
  venues: { id: string; name: string }[];
  organizationId: string;
  onEdit: (attachment: Attachment | null) => void;
  searchPlaceholder?: string;
}

export function AttachmentList({
  venues,
  organizationId,
  onEdit,
  searchPlaceholder = "Filtrar anexos..."
}: AttachmentListProps) {
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const { attachments, isLoading, fetchAttachments, deleteAttachment } = useAttachmentStore();
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  useEffect(() => {
    fetchAttachments(organizationId);
  }, [organizationId, fetchAttachments]);

  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    try {
      await deleteAttachment(attachmentToDelete.id);
      setAttachmentToDelete(null);
    } catch (error) {
      // O erro já é tratado na store
    }
  };

  if (isLoading) {
    return <AttachmentListSkeleton />;
  }

  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_CONTRACTS"
    );
  };

  return (
    <div className="space-y-4">
      <FilterList
        items={attachments}
        filterBy={(attachment, query) =>
          attachment.title.toLowerCase().includes(query.toLowerCase())
        }
        placeholder={searchPlaceholder}
      >
        {(filteredAttachments) =>
          filteredAttachments.length === 0 ? (
            <EmptyState
              hasEditPermission={hasEditPermission()}
              title="Nenhum anexo encontrado"
              actionText="Novo Anexo"
              onAction={() => onEdit(null)}
            />
          ) : (
            <Table className="bg-white rounded-lg shadow-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:block">Locação</TableHead>
                  {hasEditPermission() && (
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttachments.map((attachment) => (
                  <TableRow key={attachment.id} onClick={() => hasEditPermission() && onEdit(attachment)} className="hover:bg-gray-50 cursor-pointer transition">
                    <TableCell className="font-medium" >
                      {attachment.title}
                    </TableCell>
                    <TableCell className="hidden md:block">
                      {attachment.venueId ? (
                        <span className="inline-block bg-blue-300 text-white px-2 py-1 rounded text-xs font-medium">
                          {attachment?.venue?.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Sem locação</span>
                      )}
                    </TableCell>
                    {hasEditPermission() && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); onEdit(attachment); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setAttachmentToDelete(attachment); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }
      </FilterList>
      <ConfirmDeleteDialog
        open={!!attachmentToDelete}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
        onConfirm={async () => {
          await handleDelete();
        }}
        entityName={attachmentToDelete?.title || ""}
        entityType="anexo"
      />
    </div>
  );
} 