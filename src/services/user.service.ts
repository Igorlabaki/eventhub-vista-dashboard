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
}; 