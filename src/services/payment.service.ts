import { api } from '@/lib/axios';
import {
    CreatePaymentDTO,
    UpdatePaymentDTO,
    ListPaymentParams,
    PaymentListResponse,
    PaymentByIdResponse,
    PaymentUpdateResponse,
    PaymentCreateResponse,
    PaymentDeleteResponse
} from '@/types/payment';

export type CreatePaymentWithFileDTO = Omit<CreatePaymentDTO, 'imageUrl'> & {
    paymentMethod: string;
    file?: File;
};

export const paymentService = {
    createPayment: async (data: CreatePaymentWithFileDTO) => {
        const formData = new FormData();
        formData.append('amount', String(data.amount));
        formData.append('userId', data.userId);
        formData.append('venueId', data.venueId);
        formData.append('proposalId', data.proposalId);
        formData.append('username', data.username);
        formData.append('paymentDate', data.paymentDate);
        formData.append('paymentMethod', data.paymentMethod);
        if (data.file) {
            formData.append('file', data.file, data.file.name);
        }
        const response = await api.post<PaymentCreateResponse>('/payment/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getPaymentById: async (paymentId: string) => {
        const response = await api.get<PaymentByIdResponse>(`/payment/byId/${paymentId}`);
        return response.data;
    },

    updatePayment: async (data: UpdatePaymentDTO & { file?: File }) => {
        const formData = new FormData();
        formData.append('userId', data.userId);
        formData.append('username', data.username);
        formData.append('paymentId', data.paymentId);
        formData.append('proposalId', data.proposalId);
        formData.append('amount', String(data.amount));
        formData.append('paymentDate', data.paymentDate);
        if (data.imageUrl) {
            formData.append('imageUrl', data.imageUrl);
        }
        if (data.paymentMethod) {
            formData.append('paymentMethod', data.paymentMethod);
        }
        if (data.file) {
            formData.append('file', data.file, data.file.name);
        }
        const response = await api.put<PaymentUpdateResponse>('/payment/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    listPayments: async (params: ListPaymentParams) => {
        const queryParams = new URLSearchParams();
        if (params.venueId) queryParams.append('venueId', params.venueId);
        if (params.proposalId) queryParams.append('proposalId', params.proposalId);

        const response = await api.get<PaymentListResponse>(`/payment/list?${queryParams.toString()}`);
        return response.data;
    },

    deletePayment: async (paymentId: string) => {
        const response = await api.delete<PaymentDeleteResponse>(`/payment/delete/${paymentId}`);
        return response.data;
    }
};
