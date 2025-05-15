import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userService } from '../../../services/user.service';

interface UpdatePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useUpdatePassword() {
  return useMutationWithError<unknown, UpdatePasswordParams>(userService.updatePassword);
} 