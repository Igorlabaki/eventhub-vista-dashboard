import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useProposalStore } from "@/store/proposalStore";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useContactStore } from "@/store/contactStore";
import { ContactType, Contact } from "@/types/contact";
import { useEffect, useState } from "react";
import { ErrorPage } from "@/components/ErrorPage";
import { FilterList } from "@/components/filterList";
type FormValues = {
  message: string;
};

export default function SendMessagePage() {
  const { id } = useParams();
  const { currentProposal } = useProposalStore();
  const { selectedVenue: venue } = useVenueStore();
  const { user } = useUserStore();
  const { contacts, fetchContacts, isLoading, error } = useContactStore();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const form = useForm<FormValues>({
    defaultValues: {
      message: "",
    },
  });

  // Atualiza a mensagem sempre que os fornecedores selecionados mudam
  useEffect(() => {
    const msg = selectedContacts
      .map((contactId) => {
        const contact = contacts.find((c) => c.id === contactId);
        if (!contact) return "";
        const urls = [];
        if (contact.instagramUrl) urls.push(`Instagram: ${contact.instagramUrl}`);
        if (contact.facebookUrl) urls.push(`Facebook: ${contact.facebookUrl}`);
        if (contact.tiktokUrl) urls.push(`TikTok: ${contact.tiktokUrl}`);
        if (contact.url) urls.push(`Site: ${contact.url}`);
        return `\n- ${contact.name}${contact.role ? ` (${contact.role})` : ""}${urls.length ? `\n  ${urls.join(" | ")}` : ""}\n`;
      })
      .filter(Boolean)
      .join("\n");
    form.setValue(
      "message",
      `Nossas indicações para o seu evento:${msg ? `\n${msg}` : ""}`
    );
  }, [selectedContacts, contacts, form]);

  // Buscar fornecedores do venue atual

  useEffect(() => {
    if (venue?.id) {
      fetchContacts({ venueId: venue.id, type: ContactType.SUPPLIER });
    }
  }, [venue?.id, fetchContacts]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const onSubmit = (values: FormValues) => {
    const numeroOriginal = currentProposal.whatsapp || "";
    const numeroLimpo = numeroOriginal.replace(/\D/g, "");

    const numeroComPlus = numeroOriginal.startsWith("+")
      ? numeroOriginal
      : `+${numeroLimpo}`;
    const phoneNumber = parsePhoneNumberFromString(numeroComPlus);

    const numeroFinal =
      phoneNumber && phoneNumber.isValid()
        ? phoneNumber.number.replace("+", "") // remove "+"
        : `55${numeroLimpo}`; // fallback to Brazil

    const link = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(
      values.message
    )}`;
    window.open(link, "whatsapp");
  };
  console.log(contacts);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Enviar Mensagem"
        subtitle="Envie uma mensagem para o cliente"
      >
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

  if(error){
    return <ErrorPage />;
  }

  return (
    <DashboardLayout
      title="Enviar Mensagem"
      subtitle="Envie uma mensagem para o cliente"
    >
      <FormLayout
        title="Enviar fornecedores"
        form={form}
        onSubmit={onSubmit}
        submitLabel="Enviar via WhatsApp"
      >
        <div className="mb-6">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem para o cliente</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Selecione os fornecedores:</h2>
          {!isLoading && contacts.length === 0 && (
            <div>Nenhum fornecedor encontrado.</div>
          )}
          <FilterList
            items={contacts}
            filterBy={(item, query) => {
              const q = query.toLowerCase();
              return (
                (item.name?.toLowerCase().includes(q) ?? false) ||
                (item.role?.toLowerCase().includes(q) ?? false)
              );
            }}
            placeholder="Buscar fornecedor..."
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
                        <div className="font-semibold text-base text-gray-900">
                          {contact.name}
                        </div>
                        {contact.role && (
                          <div className="text-sm text-gray-500 italic">
                            {contact.role}
                          </div>
                        )}
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
