import { create } from 'zustand';
import { 
  Image, 
  CreateImageDTO, 
  UpdateImageDTO,
  ListImageParams,
  GetByTagImageParams,
  CreateImageOrganizationDTO,
  UpdateImageOrganizationDTO,
  ListImageOrganizationParams,
  GetByTagImageOrganizationParams
} from '@/types/image';
import { imageService } from '@/services/image.service';
import { BackendResponse } from '@/lib/error-handler';

interface ImageStore {
  images: Image[];
  currentImage: Image | null;
  isLoading: boolean;
  error: string | null;
  setImages: (images: Image[]) => void;
  setCurrentImage: (image: Image | null) => void;
  fetchImages: (params: ListImageParams) => Promise<void>;
  fetchImagesByTag: (params: GetByTagImageParams) => Promise<void>;
  fetchImageById: (imageId: string) => Promise<void>;
  createImage: (data: CreateImageDTO) => Promise<BackendResponse<Image>>;
  updateImage: (data: UpdateImageDTO) => Promise<BackendResponse<Image>>;
  deleteImage: (id: string) => Promise<BackendResponse<void>>;
  addImage: (image: Image) => void;
  updateImageInStore: (image: Image) => void;
  removeImage: (id: string) => void;
  clearError: () => void;
  organizationImages: Image[];
  setOrganizationImages: (images: Image[]) => void;
  fetchOrganizationImages: (params: ListImageOrganizationParams) => Promise<void>;
  fetchOrganizationImagesByTag: (params: GetByTagImageOrganizationParams) => Promise<void>;
  createOrganizationImage: (data: CreateImageOrganizationDTO) => Promise<BackendResponse<Image>>;
  updateOrganizationImage: (data: UpdateImageOrganizationDTO) => Promise<BackendResponse<Image>>;
  removeOrganizationImage: (id: string) => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  currentImage: null,
  isLoading: false,
  error: null,
  organizationImages: [],
  setImages: (images) => set({ images }),
  setCurrentImage: (image) => set({ currentImage: image }),
  setOrganizationImages: (images) => set({ organizationImages: images }),
  
  fetchImages: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.listImages(params);
      set({ images: response.data.imageList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as imagens.",
        images: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchImagesByTag: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.getImagesByTag(params);
      set({ images: response.data.imageList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as imagens por tag.",
        images: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchImageById: async (imageId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.getImageById(imageId);
      set({ currentImage: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar a imagem.",
        currentImage: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createImage: async (data: CreateImageDTO & { file: File, responsiveMode: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.createImage(data);
      set((state) => ({ 
        images: [...state.images, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Imagem criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a imagem.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateImage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.updateImage(data);
      set((state) => ({
        images: state.images.map((i) => i.id === response.data.id ? response.data : i),
        currentImage: state.currentImage && state.currentImage.id === response.data.id ? response.data : state.currentImage,
        isLoading: false
      }));
      return {
        success: true,
        message: "Imagem atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a imagem.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteImage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await imageService.deleteImage(id);
      set((state) => ({
        images: state.images.filter((i) => i.id !== id),
        organizationImages: state.organizationImages.filter((i) => i.id !== id),
        currentImage: state.currentImage && state.currentImage.id === id ? null : state.currentImage,
        isLoading: false
      }));
      return {
        success: true,
        message: "Imagem excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir a imagem.",
        isLoading: false 
      });
      throw err;
    }
  },

  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  
  updateImageInStore: (image) => set((state) => ({
    images: state.images.map((i) => i.id === image.id ? image : i),
    currentImage: state.currentImage && state.currentImage.id === image.id ? image : state.currentImage,
  })),
  
  removeImage: (id) => set((state) => ({
    images: state.images.filter((i) => i.id !== id),
    currentImage: state.currentImage && state.currentImage.id === id ? null : state.currentImage,
  })),
  
  clearError: () => set({ error: null }),

  fetchOrganizationImages: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.listImagesOrganization(params);
      set({ organizationImages: response.data.imageList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as imagens da organização.",
        organizationImages: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrganizationImagesByTag: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.getImagesByTagOrganization(params);
      set({ organizationImages: response.data.imageList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as imagens da organização por tag.",
        organizationImages: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrganizationImage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.createImageOrganization(data);
      set((state) => ({ 
        organizationImages: [...state.organizationImages, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Imagem da organização criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a imagem da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateOrganizationImage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imageService.updateImageOrganization(data);
      set((state) => ({
        organizationImages: state.organizationImages.map((i) => i.id === response.data.id ? response.data : i),
        isLoading: false
      }));
      return {
        success: true,
        message: "Imagem da organização atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a imagem da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  removeOrganizationImage: (id) => set((state) => ({
    organizationImages: state.organizationImages.filter((i) => i.id !== id),
  })),
})); 