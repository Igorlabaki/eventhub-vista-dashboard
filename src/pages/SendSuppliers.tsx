import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FormLayout } from "@/components/ui/form-layout";
import { useVenueStore } from "@/store/venueStore";
import { useContactStore } from "@/store/contactStore";
import { ContactType, Contact } from "@/types/contact";
import { useEffect, useState } from "react";
import { ErrorPage } from "@/components/ErrorPage";
import { FilterList } from "@/components/filterList";
import { proposalService } from "@/services/proposal.service";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = Record<string, never>;

export default function SendMessagePage() {
  const { id } = useParams();
  const { selectedVenue: venue } = useVenueStore();
  const { contacts, fetchContacts, isLoading, error } = useContactStore();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>();
  const link = id ? `${window.location.origin}/proposal/${id}/indications` : "";

  useEffect(() => {
    if (!venue?.id || !id) return;
    let active = true;
    setPageError(false);
    setReady(false);
    Promise.all([
      fetchContacts({ venueId: venue.id, type: ContactType.SUPPLIER }),
      proposalService.listProposalIndications(id),
    ])
      .then(([, indications]) => {
        if (!active) return;
        setSelectedContacts(indications.data.indications.map((item) => item.id));
        setReady(true);
      })
      .catch(() => {
        if (active) setPageError(true);
      });
    return () => {
      active = false;
    };
  }, [venue?.id, id, fetchContacts]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((item) => item !== contactId) : [...prev, contactId]
    );
  };

  const onSubmit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const response = await proposalService.replaceProposalIndications(id, selectedContacts);
      setSelectedContacts(response.data.contactIds);
      const { title, message } = handleBackendSuccess(response, "Indicações salvas.");
      showSuccessToast({ title, description: message });
    } catch (saveError) {
      const { title, message } = handleBackendError(saveError, "Não foi possível salvar as indicações.");
      toast({ title, description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      showSuccessToast({ title: "Link copiado", description: "O link das indicações está na área de transferência." });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Selecione o link e copie manualmente.",
        variant: "destructive",
      });
    }
  };

  if (error || pageError) {
    return <ErrorPage />;
  }

  if (isLoading || !ready) {
    return (
      <DashboardLayout title="Indicar parceiros" subtitle="Escolha os parceiros deste orçamento">
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <div className="flex items-start p-4 border rounded-lg shadow-sm bg-gray-100 animate-pulse">
                <div className="w-5 h-5 rounded border bg-gray-300 mr-4" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Indicar parceiros" subtitle="Salve quem será indicado neste orçamento">
      <FormLayout
        title="Parceiros indicados"
        form={form}
        onSubmit={onSubmit}
        submitLabel="Salvar indicações"
        isSubmitting={saving}
      >
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium">Link da página</p>
          <div className="flex gap-2">
            <Input readOnly value={link} aria-label="Link das indicações" />
            <Button type="button" variant="outline" onClick={copyLink}>
              Copiar
            </Button>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Selecione:</h2>
          {!isLoading && contacts.length === 0 && <div>Nenhum parceiro encontrado.</div>}
          <FilterList
            items={contacts}
            filterBy={(item, query) => {
              const q = query.toLowerCase();
              return (item.name?.toLowerCase().includes(q) ?? false) || (item.role?.toLowerCase().includes(q) ?? false);
            }}
            placeholder="Buscar parceiro..."
          >
            {(filtered) => (
              <ul className="space-y-3">
                {filtered.map((contact: Contact) => (
                  <li key={contact.id}>
                    <label className="flex items-start p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="mt-1 mr-4 accent-purple-600"
                      />
                      <div>
                        <div className="font-semibold text-base text-gray-900">{contact.name}</div>
                        {contact.role && <div className="text-sm text-gray-500 italic">{contact.role}</div>}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </FilterList>
        </div>
      </FormLayout>
    </DashboardLayout>
  );
}
