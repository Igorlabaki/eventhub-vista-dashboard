import axios from "axios";
import { 
  CreateDocumentDTO,
  UpdateDocumentDTO,
  ListDocumentParams,
  DocumentListResponse,
  DocumentByIdResponse,
  DocumentCreateResponse,
  DocumentDeleteResponse,
  DocumentUpdateResponse
} from '@/types/document';
import { api } from "@/lib/axios";

const API_URL = import.meta.env.VITE_API_URL;

export const documentService = {
  async createDocument(data: CreateDocumentDTO): Promise<DocumentCreateResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('proposalId', data.proposalId);
    formData.append('fileType', data.fileType);
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post(`/document/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDocumentById(id: string): Promise<DocumentByIdResponse> {
    const response = await api.get(`/document/${id}`);
    return response.data;
  },

  async updateDocument({ documentId, title, fileType, file, imageUrl }: UpdateDocumentDTO): Promise<DocumentUpdateResponse> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('documentId', documentId);
    if (fileType) {
      formData.append('fileType', fileType);
    }
    if (file) {
      formData.append('file', file);
    }
    if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    }

    const response = await api.put(`/document/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listDocuments(params: ListDocumentParams): Promise<DocumentListResponse> {
    const response = await api.get(`/document/list?proposalId=${params.proposalId}`);
    return response.data;
  },

  async deleteDocument(id: string): Promise<DocumentDeleteResponse> {
    const response = await api.delete(`/document/delete/${id}`);
    return response.data;
  }
}; 