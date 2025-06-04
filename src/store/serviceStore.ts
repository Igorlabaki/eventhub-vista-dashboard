import { create } from 'zustand';
import { 
    Service, 
    ServiceListResponse, 
    ServiceByIdResponse, 
    ServiceCreateResponse, 
    ServiceDeleteResponse, 
    ServiceUpdateResponse,
    CreateServiceDTO,
    UpdateServiceDTO
} from '@/types/service';
import { serviceService } from '@/services/service.service';
import { BackendResponse } from '@/lib/error-handler';

interface ServiceStore {
    services: Service[];
    currentService: Service | null;
    isLoading: boolean;
    error: string | null;
    setServices: (services: Service[]) => void;
    setCurrentService: (service: Service | null) => void;
    fetchServices: (venueId: string, name?: string) => Promise<void>;
    fetchServiceById: (serviceId: string) => Promise<void>;
    createService: (data: CreateServiceDTO) => Promise<BackendResponse<Service>>;
    updateService: (data: UpdateServiceDTO) => Promise<BackendResponse<Service>>;
    deleteService: (id: string) => Promise<BackendResponse<void>>;
    addService: (service: Service) => void;
    updateServiceInStore: (service: Service) => void;
    removeService: (id: string) => void;
    clearError: () => void;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
    services: [],
    currentService: null,
    isLoading: false,
    error: null,

    setServices: (services) => set({ services }),
    setCurrentService: (service) => set({ currentService: service }),

    fetchServices: async (venueId: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await serviceService.getServicesList(venueId, name);
            set({ services: response.data.serviceList });
        } catch (err: unknown) {
            const error = err as ApiError;
            set({ 
                error: error?.response?.data?.message || "Não foi possível carregar os serviços.",
                services: [] 
            });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchServiceById: async (serviceId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await serviceService.getServiceById(serviceId);
            set({ currentService: response.data.service });
        } catch (err: unknown) {
            const error = err as ApiError;
            set({ 
                error: error?.response?.data?.message || "Não foi possível carregar o serviço.",
                currentService: null 
            });
        } finally {
            set({ isLoading: false });
        }
    },

    createService: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await serviceService.createService(data);
            set((state) => ({ 
                services: [...state.services, response.data],
                isLoading: false 
            }));
            return {
                success: true,
                message: "Serviço criado com sucesso",
                data: response.data
            };
        } catch (err: unknown) {
            const error = err as ApiError;
            set({ 
                error: error?.response?.data?.message || "Não foi possível criar o serviço.",
                isLoading: false 
            });
            throw err;
        }
    },

    updateService: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await serviceService.updateService(data);
            set((state) => ({
                services: state.services.map((s) => s.id === data.serviceId ? response.data : s),
                currentService: state.currentService && state.currentService.id === data.serviceId ? response.data : state.currentService,
                isLoading: false
            }));
            return {
                success: true,
                message: "Serviço atualizado com sucesso",
                data: response.data
            };
        } catch (err: unknown) {
            const error = err as ApiError;
            set({ 
                error: error?.response?.data?.message || "Não foi possível atualizar o serviço.",
                isLoading: false 
            });
            throw err;
        }
    },

    deleteService: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await serviceService.deleteService(id);
            set((state) => ({
                services: state.services.filter((s) => s.id !== id),
                currentService: state.currentService && state.currentService.id === id ? null : state.currentService,
                isLoading: false
            }));
            return {
                success: true,
                message: "Serviço excluído com sucesso",
                data: undefined
            };
        } catch (err: unknown) {
            const error = err as ApiError;
            set({ 
                error: error?.response?.data?.message || "Não foi possível excluir o serviço.",
                isLoading: false 
            });
            throw err;
        }
    },

    addService: (service) => set((state) => ({ services: [...state.services, service] })),
    
    updateServiceInStore: (service) => set((state) => ({
        services: state.services.map((s) => s.id === service.id ? service : s),
        currentService: state.currentService && state.currentService.id === service.id ? service : state.currentService,
    })),
    
    removeService: (id) => set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        currentService: state.currentService && state.currentService.id === id ? null : state.currentService,
    })),
    
    clearError: () => set({ error: null }),
})); 