import { Proposal } from "./proposal";
import { Payment } from "./payment";

export enum DocumentType {
  PDF = "PDF",
  IMAGE = "IMAGE"
}

export interface Document {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
  fileType: DocumentType;
  proposalId: string;
  paymentId?: string;
  proposal: Proposal;
  payment?: Payment;
}

export interface CreateDocumentDTO {
  title: string;
  proposalId: string;
  fileType: DocumentType;
  file?: File | null;
  pdfUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface UpdateDocumentDTO {
  documentId: string;
  title: string;
  fileType?: DocumentType;
  file?: File | null;
  imageUrl?: string;
}

export interface ListDocumentParams {
  proposalId: string;
  imageUrl?: string;
}

export interface DocumentByIdResponse {
  success: true;
  message: string;
  data: Document;
  count: number;
  type: string;
}

export interface DocumentListResponse {
  success: true;
  message: string;
  data: {
    documentList: Document[];
  };
  count: number;
  type: string;
}

export interface DocumentCreateResponse {
  success: true;
  message: string;
  data: Document;
  count: number;
  type: string;
}

export interface DocumentDeleteResponse {
  success: true;
  message: string;
  data: Document;
  count: number;
  type: string;
}

export interface DocumentUpdateResponse {
  success: true;
  message: string;
  data: Document;
  count: number;
  type: string;
} 