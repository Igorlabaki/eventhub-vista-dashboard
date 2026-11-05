
import { api } from "@/lib/axios";
import { buildContactBody } from "@/lib/contact-body";
import { 
  CreateContactParams, 
  UpdateContactParams, 
  ListContactsParams,
  ContactListResponse,
  ContactResponse 
} from "@/types/contact";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const contactService = {
  async create(params: CreateContactParams, file?: File): Promise<ContactResponse> {
    const body = buildContactBody(params, file);
    const response = await api.post("/contact/create", body, file ? multipart : undefined);
    return response.data;
  },

  async list(params: ListContactsParams): Promise<ContactListResponse> {
    const query = new URLSearchParams();
    query.set("venueId", params.venueId);
    if (params.name) query.set("name", params.name);
    if (params.type) query.set("type", params.type);
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    if (params.page) query.set("page", params.page);
    if (params.summary) query.set("summary", "true");
    const response = await api.get(`/contact/list?${query.toString()}`);
    return response.data;
  },

  async update(params: UpdateContactParams, file?: File): Promise<ContactResponse> {
    const body = buildContactBody(params, file);
    const response = await api.put("/contact/update", body, file ? multipart : undefined);
    return response.data;
  },

  async delete(contactId: string): Promise<void> {
    await api.delete(`/contact/delete/${contactId}`);
  }
}; 