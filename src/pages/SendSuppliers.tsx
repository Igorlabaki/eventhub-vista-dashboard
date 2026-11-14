import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Link2, Loader2, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorPage } from "@/components/ErrorPage";
import { EmptyState } from "@/components/EmptyState";
import { ContactListSkeleton } from "@/components/contact/contact-list-skeleton";
import { IndicatedPartnersSummary } from "@/components/proposal/IndicatedPartnersSummary";
import { IndicatedPartnersTable } from "@/components/proposal/IndicatedPartnersTable";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError } from "@/lib/error-handler";
import type { PartnerCategory } from "@/lib/partner-category";
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS } from "@/lib/partner-category";
import { createIndicationSync, toggleIndication } from "@/lib/proposal-indication-sync";
import { proposalService } from "@/services/proposal.service";
import { useContactStore } from "@/store/contactStore";
import { useVenueStore } from "@/store/venueStore";
import { ContactType } from "@/types/contact";

type SaveState = "idle" | "saving" | "saved";

export default function SendSuppliers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedVenue: venue } = useVenueStore();
  const {
    contacts,
    isLoading,
    contactListPagination,
    contactListSummary,
    contactListError,
    lastListParams,
    fetchContacts,
  } = useContactStore();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<"" | PartnerCategory>("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [indicationsReady, setIndicationsReady] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [venueTotal, setVenueTotal] = useState<number | null>(null);
  const sync = useRef<ReturnType<typeof createIndicationSync> | null>(null);
  const link = id ? `${window.location.origin}/proposal/${id}/indications` : "";

  useEffect(() => {
    if (!id) return;
    let active = true;
    setPageError(false);
    setIndicationsReady(false);
    proposalService
      .listProposalIndications(id)
      .then((response) => {
        if (!active) return;
        const initial = response.data.indications.map((item) => item.id);
        setSelected(initial);
        sync.current = createIndicationSync(initial, {
          save: async (ids) => (await proposalService.replaceProposalIndications(id, ids)).data.contactIds,
          onSaved: () => {
            if (active) setSaveState("saved");
          },
          onFailed: (confirmed, error) => {
            if (!active) return;
            setSelected(confirmed);
            setSaveState("idle");
            const { title, message } = handleBackendError(error, "Não foi possível salvar a indicação.");
            toast({ title, description: message, variant: "destructive" });
          },
        });
        setIndicationsReady(true);
      })
      .catch(() => {
        if (active) setPageError(true);
      });
    return () => {
      active = false;
      sync.current = null;
    };
  }, [id, toast]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchInput.trim();
      setSearchTerm((current) => {
        if (current !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!venue?.id) return;
    fetchContacts({
      venueId: venue.id,
      type: ContactType.SUPPLIER,
      q: searchTerm || undefined,
      category: category || undefined,
      page: String(page),
      summary: true,
    });
  }, [venue?.id, fetchContacts, searchTerm, category, page]);

  const listIsOurs =
    !!venue?.id && lastListParams?.venueId === venue.id && lastListParams.type === ContactType.SUPPLIER;

  useEffect(() => {
    if (!listIsOurs || isLoading || !contactListSummary) return;
    if (lastListParams?.q || lastListParams?.category) return;
    setVenueTotal(contactListSummary.total);
  }, [listIsOurs, isLoading, contactListSummary, lastListParams]);

  useEffect(() => {
    if (!contactListPagination) return;
    if (contactListPagination.totalPages > 0 && page > contactListPagination.totalPages) {
      setPage(contactListPagination.totalPages);
    }
  }, [contactListPagination, page]);

  const handleToggle = (contactId: string) => {
    if (!sync.current) return;
    const next = toggleIndication(selected, contactId);
    setSelected(next);
    setSaveState("saving");
    void sync.current.request(next);
  };

  const retry = () => {
    if (!venue?.id) return;
    fetchContacts({
      venueId: venue.id,
      type: ContactType.SUPPLIER,
      q: searchTerm || undefined,
      category: category || undefined,
      page: String(page),
      summary: true,
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      showSuccessToast({ title: "Link copiado", description: "O link das indicações está na área de transferência." });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Abra a página de indicações e copie o endereço manualmente.",
        variant: "destructive",
      });
    }
  };

  if (pageError) {
    return <ErrorPage />;
  }

  const listLoading = !indicationsReady || !listIsOurs || isLoading;
  const filtered = !!searchTerm || !!category;
  const rows = listIsOurs ? contacts : [];
  const total = listIsOurs ? contactListPagination?.total ?? 0 : 0;

  return (
    <DashboardLayout title="Indicar parceiros" subtitle="Marque os parceiros que o cliente verá neste orçamento">
      <div className="animate-fade-in">
        <div className="mb-6 rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar parceiros..."
                className="h-10 rounded-full bg-white pl-9"
              />
            </div>
            <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
              Categoria
              <select
                aria-label="Categoria"
                className="bg-transparent pr-1 outline-none"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as "" | PartnerCategory);
                  setPage(1);
                }}
              >
                <option value="">Todas</option>
                {PARTNER_CATEGORIES.map((item) => (
                  <option key={item} value={item}>{PARTNER_CATEGORY_LABELS[item]}</option>
                ))}
              </select>
            </label>
            <Button type="button" variant="outline" className="h-10 shrink-0 rounded-full" onClick={copyLink}>
              <Link2 className="h-4 w-4" />
              Copiar link das indicações
            </Button>
          </div>
        </div>

        <IndicatedPartnersSummary total={venueTotal ?? 0} indicated={selected.length} />

        <div className="mb-2 mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} parceiros</span>
          {saveState === "saving" && (
            <span className="flex items-center gap-1" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600" aria-live="polite">
              <Check className="h-4 w-4" />
              Salvo
            </span>
          )}
        </div>

        {contactListError && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{contactListError}</span>
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Tentar de novo
            </Button>
          </div>
        )}

        {listLoading ? (
          <ContactListSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            hasEditPermission={!filtered && !!venue?.id}
            title={filtered ? "Nenhum parceiro encontrado" : "Nenhum parceiro cadastrado"}
            description={
              filtered
                ? "Ajuste a busca ou a categoria."
                : "Cadastre parceiros em Contatos para indicá-los neste orçamento."
            }
            actionText="Ir para Contatos"
            onAction={() => navigate(`/venue/${venue?.id}/contacts`)}
          />
        ) : (
          <IndicatedPartnersTable contacts={rows} selectedIds={selected} onToggle={handleToggle} />
        )}

        <ProposalListPager
          page={contactListPagination?.page ?? page}
          totalPages={listIsOurs ? contactListPagination?.totalPages ?? 0 : 0}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
