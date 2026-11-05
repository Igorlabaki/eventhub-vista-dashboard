import { create } from "zustand";
import { Contact, ContactListPagination, ContactListResponse, ContactListSummary, ContactCreateResponse, ContactUpdateResponse, ContactDeleteResponse, ListContactsParams } from "@/types/contact";
import { contactService } from "@/services/contactService";

interface ContactStore {
  contacts: Contact[];
  contactListPagination: ContactListPagination | null;
  contactListSummary: ContactListSummary | null;
  contactListError: string | null;
  lastListParams: ListContactsParams | null;
  isLoading: boolean;
  error: string | null;
  setContacts: (contacts: Contact[]) => void;
  fetchContacts: (params: ListContactsParams) => Promise<void>;
  createContact: (contact: Omit<Contact, "id">, file?: File) => Promise<ContactCreateResponse>;
  updateContact: (contactId: string, data: Partial<Contact> & { removeLogo?: boolean }, file?: File) => Promise<ContactUpdateResponse>;
  deleteContact: (contactId: string, venueId: string) => Promise<ContactDeleteResponse>;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function reloadList(get: () => ContactStore, venueId: string) {
  const last = get().lastListParams;
  return get().fetchContacts(last?.venueId === venueId ? last : { venueId });
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  contactListPagination: null,
  contactListSummary: null,
  contactListError: null,
  lastListParams: null,
  isLoading: false,
  error: null,
  setContacts: (contacts) => set({ contacts }),
  clearError: () => set({ error: null, contactListError: null }),

  fetchContacts: async (params: ListContactsParams) => {
    set({ isLoading: true, error: null, contactListError: null, lastListParams: params });
    try {
      const listResponse: ContactListResponse = await contactService.list(params);
      set({
        contacts: listResponse.data.contactList,
        contactListPagination: listResponse.pagination ?? null,
        contactListSummary: listResponse.data.summary ?? null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      const message = error?.response?.data?.message || "Erro ao carregar contatos.";
      set({
        error: message,
        contactListError: message,
        contacts: [],
        contactListPagination: null,
        contactListSummary: null,
        isLoading: false
      });
    }
  },

  createContact: async (contact, file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactService.create(contact, file);
      const createResponse = response as ContactCreateResponse;
      await reloadList(get, contact.venueId);
      set({ isLoading: false });
      return createResponse;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao criar contato.",
        isLoading: false
      });
      throw err;
    }
  },

  updateContact: async (contactId, data, file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactService.update({ contactId, data }, file);
      const updateResponse = response as ContactUpdateResponse;
      await reloadList(get, data.venueId || "");
      set({ isLoading: false });
      return updateResponse;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao atualizar contato.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteContact: async (contactId, venueId) => {
    set({ isLoading: true, error: null });
    try {
      await contactService.delete(contactId);
      await reloadList(get, venueId);
      set({ isLoading: false });
      // Retorna um objeto ContactDeleteResponse manualmente
      return {
        success: true,
        message: 'Contato deletado com sucesso',
        data: {} as Contact,
        count: 0,
        type: ''
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao deletar contato.",
        isLoading: false
      });
      throw err;
    }
  },
})); 