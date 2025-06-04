import { api } from '@/lib/axios';
import { 
  CreateImageDTO, 
  UpdateImageDTO,
  ListImageParams,
  GetByTagImageParams,
  ImageListResponse, 
  ImageByIdResponse, 
  ImageUpdateResponse, 
  ImageCreateResponse, 
  ImageDeleteResponse 
} from '@/types/image';

export const imageService = {
  createImage: async (data: CreateImageDTO & { file: File, responsiveMode: string }) => {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('tag', data.tag);
    formData.append('venueId', data.venueId);
    if (data.position) formData.append('position', data.position);
    if (data.description) formData.append('description', data.description);
    if (data.responsiveMode) formData.append('responsiveMode', data.responsiveMode);
    
    const response = await api.post<ImageCreateResponse>('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getImageById: async (imageId: string) => {
    const response = await api.get<ImageByIdResponse>(`/image/byId/${imageId}`);
    return response.data;
  },

  updateImage: async (data: UpdateImageDTO) => {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);
    formData.append('imageId', data.imageId);
    formData.append('tag', data.tag);
    formData.append('venueId', data.venueId);
    if (data.position) formData.append('position', data.position);
    if (data.description) formData.append('description', data.description);
    if (data.responsiveMode) formData.append('responsiveMode', data.responsiveMode);

    const response = await api.put<ImageUpdateResponse>('/image/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listImages: async (params: ListImageParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.responsiveMode) queryParams.append('responsiveMode', params.responsiveMode);
    if (params.description) queryParams.append('description', params.description);

    const response = await api.get<ImageListResponse>(`/image/list?${queryParams.toString()}`);
    return response.data;
  },

  getImagesByTag: async (params: GetByTagImageParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.responsiveMode) queryParams.append('responsiveMode', params.responsiveMode);

    const response = await api.get<ImageListResponse>(`/image/getByTag?${queryParams.toString()}`);
    return response.data;
  },

  deleteImage: async (imageId: string) => {
    const response = await api.delete<ImageDeleteResponse>(`/image/delete/${imageId}`);
    return response.data;
  }
}; 