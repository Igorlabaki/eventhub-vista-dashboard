import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { FilterList } from "@/components/filterList";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueRuleStore } from "@/store/venueRuleStore";
import { VenueRule } from "@/types/venue-rule";

interface VenueRuleListProps {
    rules: VenueRule[];
    onCreateClick: () => void;
    onEditClick: (rule: VenueRule) => void;
}

export function VenueRuleList({ rules, onCreateClick, onEditClick }: VenueRuleListProps) {
    const [ruleToDelete, setRuleToDelete] = useState<VenueRule | null>(null);
    const { deleteRule } = useVenueRuleStore();
    const { toast } = useToast();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();
    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_RULES") ?? false;

    const handleDelete = async () => {
        if (!ruleToDelete) return;
        try {
            const response = await deleteRule(ruleToDelete.id);
            const { title, message } = handleBackendSuccess(response, "Regra excluída com sucesso!");
            showSuccessToast({ title, description: message });
            setRuleToDelete(null);
        } catch (error: unknown) {
            const { title, message } = handleBackendError(error, "Erro ao excluir regra. Tente novamente mais tarde.");
            toast({ title, description: message, variant: "destructive" });
        }
    };

    return (
        <>
            <FilterList
                items={rules}
                filterBy={(rule, query) =>
                    `${rule.title ?? ""} ${rule.text}`.toLowerCase().includes(query.toLowerCase())
                }
                placeholder="Filtrar regras..."
            >
                {(filtered) =>
                    filtered.length === 0 ? (
                        <EmptyState
                            hasEditPermission={canEdit}
                            title="Nenhuma regra cadastrada"
                            actionText="Nova regra"
                            onAction={onCreateClick}
                        />
                    ) : (
                        <Table className="bg-white rounded-md shadow-lg">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Posição</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Regra</TableHead>
                                    {canEdit && <TableHead className="w-[100px] text-center">Ações</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell>{rule.position}</TableCell>
                                        <TableCell className="font-medium">{rule.title || "—"}</TableCell>
                                        <TableCell className="max-w-xl whitespace-pre-wrap">{rule.text}</TableCell>
                                        {canEdit && (
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <button type="button" aria-label="Editar regra" onClick={() => onEditClick(rule)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" aria-label="Excluir regra" onClick={() => setRuleToDelete(rule)}>
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
                open={!!ruleToDelete}
                onOpenChange={(open) => {
                    if (!open) setRuleToDelete(null);
                }}
                onConfirm={handleDelete}
                entityName={ruleToDelete?.title || ruleToDelete?.text || ""}
                entityType="regra"
            />
        </>
    );
}
