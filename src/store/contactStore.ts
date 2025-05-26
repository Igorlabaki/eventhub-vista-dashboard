import { create } from "zustand";
import { Contact, ContactType, ContactListResponse, ContactCreateResponse, ContactUpdateResponse, ContactDeleteResponse } from "@/types/contact";
import { contactService } from "@/services/contactService";

interface ContactStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  setContacts: (contacts: Contact[]) => void;
  fetchContacts: (venueId: string, name?: string, type?: ContactType) => Promise<void>;
  createContact: (contact: Omit<Contact, "id">) => Promise<ContactCreateResponse>;
  updateContact: (contactId: string, data: Partial<Contact>) => Promise<ContactUpdateResponse>;
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

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  setContacts: (contacts) => set({ contacts }),
  clearError: () => set({ error: null }),

  fetchContacts: async (venueId: string, name?: string, type?: ContactType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactService.list({ venueId, name, type });
      const listResponse = response as unknown as ContactListResponse;
      set({ contacts: listResponse.data.contactList, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao carregar contatos.",
        contacts: [],
        isLoading: false
      });
    }
  },

  createContact: async (contact) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactService.create(contact);
      const createResponse = response as ContactCreateResponse;
      await get().fetchContacts(contact.venueId);
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

  updateContact: async (contactId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactService.update({ contactId, data });
      const updateResponse = response as ContactUpdateResponse;
      await get().fetchContacts(data.venueId || "");
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
      await get().fetchContacts(venueId);
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