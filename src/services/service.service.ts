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

function serviceFormData(payload: unknown, file?: File) {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (file) formData.append("file", file, file.name);
    return formData;
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const serviceService = {
    createService: async (data: CreateServiceDTO) => {
        const { file, ...payload } = data;
        const response = await api.post<ServiceCreateResponse>('/service/create', serviceFormData(payload, file), multipart);
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

    updateService: async ({ file, ...data }: UpdateServiceDTO) => {
        const response = await api.put<ServiceUpdateResponse>('/service/update', serviceFormData(data, file), multipart);
        return response.data;
    },

    deleteService: async (id: string) => {
        const response = await api.delete<ServiceDeleteResponse>(`/service/delete/${id}`);
        return response.data;
    }
}; 