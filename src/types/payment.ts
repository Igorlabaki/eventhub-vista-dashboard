import { Proposal } from "./proposal";
import { Venue } from "@/components/ui/venue-list";
/* import { Document } from "./document"; */

export enum PaymentMethod {
    PIX = "PIX",
    CREDIT_CARD = "CREDIT_CARD"
}

export interface Payment {
    id: string;
    proposalId: string;
    venueId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod?: PaymentMethod;
    createdAt: Date;
    updatedAt: Date;
    imageUrl?: string;
    proposal: Proposal;
    venue: Venue;
    documents: unknown[];
}

export interface CreatePaymentDTO {
    amount: number;
    userId: string;
    venueId: string;
    username: string;
    proposalId: string;
    paymentDate: string;
    imageUrl?: string;
    paymentMethod?: PaymentMethod;
}

export interface UpdatePaymentDTO {
    userId: string;
    username: string;
    paymentId: string;
    proposalId: string;
    amount: number;
    paymentDate: string;
    paymentMethod?: PaymentMethod;
    imageUrl?: string;
}

export interface ListPaymentParams {
    venueId: string;
    proposalId?: string;
}

export interface PaymentByIdResponse {
    success: true;
    message: string;
    data: Payment;
    count: number;
    type: string;
}

export interface PaymentListResponse {
    success: true;
    message: string;
    data: {
        paymentList: Payment[];
    };
    count: number;
    type: string;
}

export interface PaymentCreateResponse {
    success: true;
    message: string;
    data: Payment;
    count: number;
    type: string;
}

export interface PaymentDeleteResponse {
    success: true;
    message: string;
    data: Payment;
    count: number;
    type: string;
}

export interface PaymentUpdateResponse {
    success: true;
    message: string;
    data: Payment;
    count: number;
    type: string;
} 