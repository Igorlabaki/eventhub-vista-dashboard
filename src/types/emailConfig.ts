import { Venue } from "./venue";

export type EmailConfigType = 'PROPOSAL' | 'CONTRACT';

export interface EmailConfig {
    id: string;
    backgroundImageUrl?: string;
    title?: string;
    type: EmailConfigType;
    message?: string;
    venueId: string;
    venue?: Venue;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmailConfigDTO {
    backgroundImageUrl?: string;
    title?: string;
    type: EmailConfigType;
    message?: string;
    venueId: string;
}

export interface UpdateEmailConfigDTO {
    emailConfigId: string;
    venueId: string;
    data: {
        backgroundImageUrl?: string;
        title?: string;
        type?: EmailConfigType;
        message?: string;
    };
}

export interface EmailConfigByIdResponse {
    success: true;
    message: string;
    data: {
        emailConfig: EmailConfig;
    };
    count: number;
    type: string;
}

export interface EmailConfigListResponse {
    success: true;
    message: string;
    data: {
        emailConfigList: EmailConfig[];
    };
    count: number;
    type: string;
}

export interface EmailConfigCreateResponse {
    success: true;
    message: string;
    data: EmailConfig;
    count: number;
    type: string;
}

export interface EmailConfigDeleteResponse {
    success: true;
    message: string;
    data: EmailConfig;
    count: number;
    type: string;
}

export interface EmailConfigUpdateResponse {
    success: true;
    message: string;
    data: EmailConfig;
    count: number;
    type: string;
} 