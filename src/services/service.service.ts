import { api } from '@/lib/axios';
import { 
    CreateServiceDTO, 
    ServiceListResponse, 
    ServiceByIdResponse, 
    ServiceUpdateResponse, 
    ServiceCreateResponse, 
    ServiceDeleteResponse, 
    UpdateServiceDTO 
} from '@/types/service';

export const serviceService = {
    createService: async (data: CreateServiceDTO) => {
        const response = await api.post<ServiceCreateResponse>('/service/create', data);
        return response.data;
    },

    getServicesList: async (venueId: string, name?: string) => {
        const url = name 
            ? `/service/list?venueId=${venueId}&name=${name}`
            : `/service/list?venueId=${venueId}`;
        const response = await api.get<ServiceListResponse>(url);
        return response.data;
    },

    getServiceById: async (serviceId: string) => {
        const response = await api.get<ServiceByIdResponse>(`/service/getById?serviceId=${serviceId}`);
        return response.data;
    },

    updateService: async (data: UpdateServiceDTO) => {
        const response = await api.put<ServiceUpdateResponse>('/service/update', data);
        return response.data;
    },

    deleteService: async (id: string) => {
        const response = await api.delete<ServiceDeleteResponse>(`/service/delete/${id}`);
        return response.data;
    }
}; 