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
import { useVenueStore } from "@/store/venueStore";
import { ProposalFooter } from "@/components/proposalFooter";

export default function WorkerListPage() {
  const { id: proposalId } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workerList, setWorkerList] = useState<(CreatePersonDTO & { id?: string })[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Person | null>(null);
  const fetchPersons = usePersonStore((s) => s.fetchPersons);
  const createManyPersons = usePersonStore((s) => s.createManyPersons);
  const deletePerson = usePersonStore((s) => s.deletePerson);
  const { toast } = useToast();
  const fetchProposalById = useProposalStore((s) => s.fetchProposalById);
  const currentProposal = useProposalStore((s) => s.currentProposal);
  // Venue
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [venueLoading, setVenueLoading] = useState(false);
  // Carrega a lista inicial do backend ao montar
  useEffect(() => {
    if (proposalId) {
      setIsInitialLoading(true);
      Promise.all([
        fetchPersons({ proposalId, type: PersonType.WORKER }),
        fetchProposalById(proposalId)
      ]).then(([res]) => {
        setWorkerList(res.data.personList);
        setIsInitialLoading(false);
      });
    }
  }, [proposalId, fetchPersons, fetchProposalById]);

  useEffect(() => {
    if (currentProposal?.venueId) {
      setVenueLoading(true);
      fetchVenueById(currentProposal.venueId).finally(() => setVenueLoading(false));
    }
  }, [currentProposal?.venueId, fetchVenueById]);

  if (isInitialLoading || venueLoading) {
    return <AppLoadingScreen />;
  }

  const handleAddWorker = () => {
    if (!name.trim()) return;
    setWorkerList((prev) => [
      ...prev,
      {
        name: name.trim(),
        email: email.trim() || undefined,
        proposalId: proposalId || "",
        type: PersonType.WORKER,
      },
    ]);
    setName("");
    setEmail("");
  };

  const handleRemoveWorker = (worker: Person, idx: number) => {
    if (worker.id) {
      setWorkerToDelete(worker);
      setDeleteDialogOpen(true);
    } else {
      setWorkerList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleConfirmDelete = async () => {
    if (!workerToDelete) return;
    try {
      await deletePerson(workerToDelete.id);
      setWorkerList((prev) => prev.filter((g) => g.id !== workerToDelete.id));
      toast({
        title: "Colaborador removido",
        description: `O colaborador "${workerToDelete.name}" foi removido com sucesso.`,  
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao remover colaborador."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setWorkerToDelete(null);
  };

  const handleSaveList = async () => {
    if (workerList.length === 0) return;
    setLoading(true);
    try {
      // Enviar apenas colaboradores sem id
      const newWorkers = workerList.filter(g => !g.id);
      const payload = newWorkers.map(g => ({
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
          description: "Todos os colaboradores já estão cadastrados.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const response = await createManyPersons(payload);
      setWorkerList(response.data.personList); // Atualiza localmente com o que veio do backend
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

  const filteredWorkers = workerList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()))
  );

  const savedCount = workerList.filter((g) => g.id).length;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col bg-eventhub-background py-14 px-2 md:px-8">
        <div className="flex items-center w-full justify-center mb-10">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          <span className="ml-2 font-bold text-3xl text-eventhub-primary">
            EventHub
          </span>
        </div>
        <div className="max-w-6xl w-full md:mx-auto">
          {/* Card de adicionar colaborador */}
          <div className="bg-white rounded-xl shadow py-8 px-4 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-eventhub-primary">
              Adicionar Colaborador
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
                onClick={handleAddWorker}
                title="Adicionar colaborador"
              >
                <FiPlus size={24} />
              </button>
            </div>
          </div>

          {/* Card da lista de colaboradores */}
          <div className="bg-white rounded-xl shadow py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4 text-center">
              <span className="text-lg font-bold text-center mb-6 text-eventhub-primary">
                Lista de Colaboradores: {savedCount}
              </span>
              <button
                className={`w-full text-center md:w-auto font-semibold px-6 py-2 rounded transition flex items-center  
                  ${
                    loading || workerList.length === 0 || workerList.every((g) => g.id)
                      ? "bg-gray-300 text-center text-gray-400 cursor-not-allowed"
                      : "bg-[#6C63FF] hover:bg-[#554ee0] text-white cursor-pointer shadow-md"
                  }
                `}
                onClick={handleSaveList}
                disabled={
                  loading || workerList.length === 0 || workerList.every((g) => g.id)
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
                placeholder="Buscar colaborador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredWorkers.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Nenhum colaborador adicionado.
                </div>
              ) : (
                filteredWorkers.map((g, i) => (
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
                      onClick={() => handleRemoveWorker(g as Person, i)}
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
      </main>
      <ProposalFooter selectedVenue={selectedVenue} />
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={workerToDelete?.name || ""}
        entityType="colaborador"
        isPending={false}
      />
    </div>
  );
}
