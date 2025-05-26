import { api } from '@/lib/axios';
import { UserByEmailResponse } from '@/types';

interface UpdatePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  updatePassword: async (data: UpdatePasswordParams) => {
    const response = await api.put('/auth/update-password', data);
    return response.data;
  },
  getByEmail: async (email: string) : Promise<UserByEmailResponse> => {
    const response = await api.get(`/user/getByEmail?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  async getById(userId: string) {
    // Ajuste a URL conforme seu backend
    const response = await api.get(`/user/getById?userId=${userId}`);
    // Se o backend retorna { data: user }, retorne response.data.data
    return response.data.data || response.data;
  },
  async updateAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    const response = await api.put("/user/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async updateUser(data: { userId: string; email?: string; username?: string }) {
    const response = await api.put("/user/update", data);
    return response.data;
  },
}; 