import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

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

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: ['user-by-email', email],
    queryFn: async () => {
      if (!email) return null;
      const response = await userService.getByEmail(email);
      return response.data as User;
    },
    enabled: !!email
  });
} 