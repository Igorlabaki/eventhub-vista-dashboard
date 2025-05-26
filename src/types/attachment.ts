import { Contract } from "./contract";
import { Organization } from "./organization";
import { Venue } from "./venue";

export interface Attachment {
    id: string;
    text: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    organizationId?: string;
    venueId?: string;
    organization?:Organization;
    venue?:Venue;
  };

export interface CreateAttachmentDTO {
    text: string;
    title: string;
    venueId?: string;
    organizationId: string;
}

export interface UpdateAttachmentDTO {
    attachmentId: string;
    data: {
      text: string;
      title: string;
      venueId?: string;
    };
}

export interface AttachmentByIdResponse {
    success: true,
    message: string,
    data: {
        attachment: Attachment
    },
    count: number,
    type: string
}

export interface AttachmentListResponse {
    success: true,
    message: string,
    data: {
        attachmentList: Attachment[]
    },
    count: number,
    type: string
}

export interface AttachmentCreateResponse {
    success: true,
    message: string,
    data: Attachment,
    count: number,
    type: string
}

export interface AttachmentDeleteResponse {
    success: true,
    message: string,
    data: Attachment,
    count: number,
    type: string
}

export interface AttachmentUpdateResponse {
    success: true,
    message: string,
    data: Attachment,
    count: number,
    type: string
}