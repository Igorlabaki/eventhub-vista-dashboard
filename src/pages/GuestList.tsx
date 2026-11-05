import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePersonStore } from "@/store/personStore";
import { CreatePersonDTO, PersonType, Person } from "@/types/person";
import { FiPlus } from "react-icons/fi";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useProposalStore } from "@/store/proposalStore";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import {
  publicActionClass,
  publicCardClass,
  publicColumnClass,
  publicDividerClass,
  publicEyebrowClass,
  publicLabelClass,
  publicLeadClass,
  publicTitleClass,
  publicValueClass,
} from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import { ImportPersonSpreadsheetButton } from "@/components/proposal/ImportPersonSpreadsheetButton";
import { usePersonSpreadsheetImport } from "@/components/proposal/useImportPersonSpreadsheet";
import { remainingGuestSlots } from "@/lib/person-spreadsheet";

export default function GuestListPage() {
  const { id: proposalId } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestList, setGuestList] = useState<(CreatePersonDTO & { id?: string })[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Person | null>(null);
  const fetchPersons = usePersonStore((s) => s.fetchPersons);
  const createManyPersons = usePersonStore((s) => s.createManyPersons);
  const deletePerson = usePersonStore((s) => s.deletePerson);
  const { toast } = useToast();
  const fetchProposalById = useProposalStore((s) => s.fetchProposalById);
  const currentProposal = useProposalStore((s) => s.currentProposal);
  const proposal = currentProposal?.id === proposalId ? currentProposal : null;
  const { venue, contentReady } = usePublicListVenue(proposal?.venueId, !isInitialLoading);
  const savedGuestCount = guestList.filter((guest) => guest.id).length;
  const { importing, importFile } = usePersonSpreadsheetImport({
    proposalId,
    type: PersonType.GUEST,
    list: guestList,
    setList: setGuestList,
    remainingSlots: remainingGuestSlots(proposal?.guestNumber, savedGuestCount),
    busy: loading || isInitialLoading,
  });
  // Carrega a lista inicial do backend ao montar
  useEffect(() => {
    if (proposalId) {
      setIsInitialLoading(true);
      Promise.all([
        fetchPersons({ proposalId, type: PersonType.GUEST }),
        fetchProposalById(proposalId)
      ]).then(([res]) => {
        setGuestList(res.data.personList);
        setIsInitialLoading(false);
      });
    }
  }, [proposalId, fetchPersons, fetchProposalById]);

  const handleAddGuest = () => {
    if (!name.trim()) return;
    setGuestList((prev) => [
      ...prev,
      {
        name: name.trim(),
        email: email.trim() || undefined,
        proposalId: proposalId || "",
        type: PersonType.GUEST,
      },
    ]);
    setName("");
    setEmail("");
  };

  const handleRemoveGuest = (guest: Person, idx: number) => {
    if (guest.id) {
      setGuestToDelete(guest);
      setDeleteDialogOpen(true);
    } else {
      setGuestList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleConfirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await deletePerson(guestToDelete.id);
      setGuestList((prev) => prev.filter((g) => g.id !== guestToDelete.id));
      toast({
        title: "Convidado removido",
        description: `O convidado "${guestToDelete.name}" foi removido com sucesso.`,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao remover convidado."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setGuestToDelete(null);
  };

  const handleSaveList = async () => {
    if (guestList.length === 0) return;
    setLoading(true);
    try {
      // Enviar apenas convidados sem id
      const newGuests = guestList.filter(g => !g.id);
      const payload = newGuests.map(g => ({
        ...g,
        rg: g.rg ?? undefined,
        email: g.email ?? undefined,
        userId: g.userId ?? undefined,
        username: g.username ?? undefined,
        venueInfo: g.venueInfo ?? undefined,
      }));
      if (payload.length === 0) {
        toast({
          title: "Nada para salvar",
          description: "Todos os convidados já estão cadastrados.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const response = await createManyPersons(payload);
      setGuestList(response.data.personList); // Atualiza localmente com o que veio do backend
      toast({
        title: "Sucesso",
        description: "Lista salva com sucesso!",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar lista. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const filteredGuests = guestList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()))
  );

  const listedCount = guestList.length;
  const saveLocked = loading || importing || guestList.length === 0 || guestList.every((g) => g.id);
  const guestTarget = currentProposal?.guestNumber;
  const guestLead = listedCount === 0
    ? "A lista ainda está em branco."
    : guestTarget
      ? `${listedCount} de ${guestTarget} já estão na lista.`
      : listedCount === 1
        ? "1 convidado já está na lista."
        : `${listedCount} convidados já estão na lista.`;

  return (
    <>
      <PublicVenueListShell venue={venue} contentReady={contentReady} variant="people">
        {(surface) => (
          <div className={publicColumnClass}>
            <section className={publicCardClass} style={surface.cardStyle}>
              <p className={publicEyebrowClass}>Sua celebração</p>
              <h2 className={`${publicTitleClass} mt-2`}>Quem vem com você</h2>
              <p className={publicLeadClass}>
                Inclua cada pessoa que participa deste evento. O e-mail é opcional. Se preferir, envie uma planilha com a coluna Nome e, se quiser, E-mail.
              </p>
              <div className={publicDividerClass} />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={publicLabelClass} htmlFor="guest-name">Nome</label>
                  <input
                    id="guest-name"
                    className={surface.inputClassName}
                    placeholder="Nome do convidado"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={publicLabelClass} htmlFor="guest-email">E-mail (opcional)</label>
                  <input
                    id="guest-email"
                    className={surface.inputClassName}
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-current/15 pt-5">
                <ImportPersonSpreadsheetButton
                  busy={importing}
                  disabled={loading || isInitialLoading || !proposalId}
                  onFile={importFile}
                />
                <button className={publicActionClass} onClick={handleAddGuest} type="button">
                  <FiPlus size={16} />
                  Adicionar convidado
                </button>
              </div>
            </section>

            <section className={publicCardClass} style={surface.cardStyle}>
              <h2 className={publicTitleClass}>Lista de convidados</h2>
              <p className={publicLeadClass}>{guestLead}</p>
              <div className={publicDividerClass} />
              <label className={publicLabelClass} htmlFor="guest-search">Buscar</label>
              <input
                id="guest-search"
                className={surface.inputClassName}
                placeholder="Nome ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="mt-4 max-h-[400px] overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  search.trim() ? <p className={publicLeadClass}>Nenhum convidado com esse nome.</p> : null
                ) : (
                  filteredGuests.map((g, i) => (
                    <div
                      key={g.id || `${g.name}-${i}`}
                      className="flex items-start justify-between gap-4 border-t border-current/15 py-4 first:border-t-0"
                    >
                      <div>
                        <p className={publicValueClass}>{g.name}</p>
                        {g.email && <p className="mt-1 text-[13px] opacity-70">{g.email}</p>}
                      </div>
                      <button
                        className="text-[13px] opacity-60 hover:opacity-100"
                        onClick={() => handleRemoveGuest(g as Person, i)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 flex justify-end border-t border-current/15 pt-5">
                <button className={publicActionClass} onClick={handleSaveList} disabled={saveLocked} type="button">
                  {loading ? "Salvando lista" : "Salvar lista"}
                </button>
              </div>
            </section>
          </div>
        )}
      </PublicVenueListShell>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={guestToDelete?.name || ""}
        entityType="convidado"
        isPending={false}
      />
    </>
  );
}
