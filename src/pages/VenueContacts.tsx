import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Contact, ContactType } from "@/types/contact";
import type { PartnerCategory } from "@/lib/partner-category";
import { PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS } from "@/lib/partner-category";
import { ContactSection } from "@/components/contact/contact-section";
import { ContactHeader } from "@/components/contact/contact-header";
import { ContactListSummaryCards } from "@/components/contact/contact-list-summary";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";
import { useContactStore } from "@/store/contactStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { showSuccessToast } from "@/components/ui/success-toast";

export default function VenueContacts() {
  const { id: venueId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ContactType>(ContactType.SUPPLIER);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<"" | PartnerCategory>("");
  const [page, setPage] = useState(1);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null | undefined>(undefined);
  const {
    contacts,
    isLoading,
    contactListPagination,
    contactListSummary,
    contactListError,
    fetchContacts,
  } = useContactStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();

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
    if (!venueId) return;
    fetchContacts({
      venueId,
      type: activeTab,
      q: searchTerm || undefined,
      category: activeTab === ContactType.SUPPLIER && category ? category : undefined,
      page: String(page),
      summary: true,
    });
  }, [venueId, fetchContacts, activeTab, searchTerm, category, page]);

  useEffect(() => {
    if (!contactListPagination) return;
    if (contactListPagination.totalPages > 0 && page > contactListPagination.totalPages) {
      setPage(contactListPagination.totalPages);
    }
  }, [contactListPagination, page]);

  const handleTabChange = (tab: string) => {
    if (tab !== ContactType.SUPPLIER && tab !== ContactType.TEAM_MEMBER) return;
    setActiveTab(tab);
    setCategory("");
    setPage(1);
    setSelectedContact(undefined);
    setIsCreatingContact(false);
  };

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_CONTACTS");
  };

  const retry = () => {
    if (!venueId) return;
    fetchContacts({
      venueId,
      type: activeTab,
      q: searchTerm || undefined,
      category: activeTab === ContactType.SUPPLIER && category ? category : undefined,
      page: String(page),
      summary: true,
    });
  };

  const total = contactListPagination?.total ?? contactListSummary?.total ?? 0;
  const partnerLabel = activeTab === ContactType.SUPPLIER ? "parceiro" : "colaborador";

  return (
    <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <ContactHeader
          hasPermission={hasEditPermission()}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onActionClick={() => setIsCreatingContact(true)}
          isFormOpen={isCreatingContact || selectedContact !== undefined}
        />

        <TabsContent value={activeTab} className="mt-0">
          <ContactSection
            hasPermission={hasEditPermission()}
            contacts={contacts}
            venueId={venueId || ""}
            isLoading={isLoading}
            isCreating={isCreatingContact}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            onCreateClick={() => setIsCreatingContact(true)}
            onCancelCreate={() => setIsCreatingContact(false)}
            listHeader={
              <>
                <div className="mb-6 rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Buscar contatos..."
                        className="h-10 rounded-full bg-white pl-9"
                      />
                    </div>
                    {activeTab === ContactType.SUPPLIER && (
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
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 shrink-0 rounded-full"
                      onClick={async () => {
                        const kind = activeTab === ContactType.SUPPLIER ? "partner-form" : "crew-form";
                        const link = `https://event-hub-dashboard.vercel.app/venue/${venueId}/${kind}`;
                        await navigator.clipboard.writeText(link);
                        showSuccessToast({
                          title: "Link copiado!",
                          description: `O link para cadastro de ${partnerLabel} foi copiado.`,
                        });
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                      Link para cadastro de {partnerLabel}
                    </Button>
                  </div>
                </div>
                <div className="shrink-0">
                  <ContactListSummaryCards summary={contactListSummary} />
                </div>
                <div className="mb-2 mt-4 text-sm text-muted-foreground">
                  {total} contatos
                </div>
                {contactListError && (
                  <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{contactListError}</span>
                    <Button type="button" variant="outline" size="sm" onClick={retry}>
                      Tentar de novo
                    </Button>
                  </div>
                )}
              </>
            }
            listFooter={
              <ProposalListPager
                page={contactListPagination?.page ?? page}
                totalPages={contactListPagination?.totalPages ?? 0}
                onPageChange={setPage}
              />
            }
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
