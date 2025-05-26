
import { api } from "@/lib/axios";
import { 
  Contact, 
  CreateContactParams, 
  UpdateContactParams, 
  ListContactsParams,
  ContactResponse 
} from "@/types/contact";

export const contactService = {
  async create(params: CreateContactParams): Promise<ContactResponse> {
    const response = await api.post("/contact/create", params);
    return response.data;
  },

  async list(params: ListContactsParams): Promise<Contact[]> {
    const { venueId, name, type } = params;
    const response = await api.get(`/contact/list?venueId=${venueId}&name=${name || ""}`);
    return response.data;
  },

  async update(params: UpdateContactParams): Promise<ContactResponse> {
    const response = await api.put("/contact/update", params);
    return response.data;
  },

  async delete(contactId: string): Promise<void> {
    await api.delete(`/contact/delete/${contactId}`);
  }
}; 