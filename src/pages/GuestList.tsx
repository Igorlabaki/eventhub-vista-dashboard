import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePersonStore } from "@/store/personStore";
import { CreatePersonDTO, PersonType, Person } from "@/types/person";
import { FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Calendar } from "lucide-react";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { useProposalStore } from "@/store/proposalStore";

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
  // Carrega a lista inicial do backend ao montar
  useEffect(() => {
    if (proposalId) {
      fetchPersons({ proposalId, type: PersonType.GUEST }).then((res) => {
        setGuestList(res.data.personList);
        setIsInitialLoading(false);
      });
      fetchProposalById(proposalId);
    }
  }, [proposalId, fetchPersons, fetchProposalById]);

  if (isInitialLoading) {
    return <AppLoadingScreen />;
  }

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

  const savedCount = guestList.filter((g) => g.id).length;

  return (
    <div className="min-h-screen bg-eventhub-background py-8 px-2 md:px-8">
      <div className="flex items-center w-full justify-center mb-10">
        <Calendar className="h-8 w-8 text-eventhub-primary" />
        <span className="ml-2 font-bold text-3xl text-eventhub-primary">
          EventHub
        </span>
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Card de adicionar convidado */}
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-eventhub-primary">
            Adicionar Convidado
          </h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-gray-600 font-semibold mb-1">Nome</label>
              <input
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-600 font-semibold mb-1">
                Email (opcional)
              </label>
              <input
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary"
                placeholder="Email (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <button
              className="bg-eventhub-primary text-white rounded-full p-3 mt-4 md:mt-0 flex items-center justify-center hover:bg-eventhub-secondary transition"
              onClick={handleAddGuest}
              title="Adicionar convidado"
            >
              <FiPlus size={24} />
            </button>
          </div>
        </div>

        {/* Card da lista de convidados */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4 text-center">
            <span className="text-lg font-bold text-center mb-6 text-eventhub-primary">
              Lista de Convidados: {savedCount} / {currentProposal?.guestNumber}
            </span>
            <button
              className={`w-full text-center md:w-auto font-semibold px-6 py-2 rounded transition flex items-center  
                ${
                  loading || guestList.length === 0 || guestList.every((g) => g.id)
                    ? "bg-gray-300 text-center text-gray-400 cursor-not-allowed"
                    : "bg-[#6C63FF] hover:bg-[#554ee0] text-white cursor-pointer shadow-md"
                }
              `}
              onClick={handleSaveList}
              disabled={
                loading || guestList.length === 0 || guestList.every((g) => g.id)
              }
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                "SALVAR LISTA"
              )}
            </button>
          </div>
          {/* Barra de pesquisa com ícone dentro */}
          <div className="mb-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FiSearch size={20} />
            </span>
            <input
              className="w-full border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary"
              placeholder="Buscar convidado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredGuests.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                Nenhum convidado adicionado.
              </div>
            ) : (
              filteredGuests.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-100 rounded px-4 py-3 hover:bg-gray-200 transition"
                >
                  <div>
                    <span className="font-medium">{g.name}</span>
                    {g.email && (
                      <span className="text-gray-500 ml-2 text-sm">
                        {g.email}
                      </span>
                    )}
                  </div>
                  <button
                    className="text-gray-500 hover:text-red-600 transition"
                    onClick={() => handleRemoveGuest(g as Person, i)}
                    title="Remover"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={guestToDelete?.name || ""}
        entityType="convidado"
        isPending={false}
      />
    </div>
  );
}
