import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  googleId?: string;
  fcmToken?: string;
}

interface UserResponse {
  success: boolean;
  message: string;
  data: User;
  count: number;
  type: string;
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const session = localStorage.getItem('@EventHub:session');
      if (!session) return null;
      
      const { userId } = JSON.parse(session);
      const response = await api.get<UserResponse>(`/user/getById?userId=${userId}`);
      return response.data.data;
    },
    enabled: !!localStorage.getItem('@EventHub:token')
  });
}