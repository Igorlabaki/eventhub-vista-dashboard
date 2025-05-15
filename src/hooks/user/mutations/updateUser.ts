import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithError } from "@/hooks/useMutationWithError";
import { api } from "@/lib/axios";

interface UpdateUserParams {
  userId: string;
  name?: string;
  email?: string;
  googleId?: string;
  username?: string;
  avatarUrl?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutationWithError<unknown, UpdateUserParams>(
    async (data: UpdateUserParams) => {
      const response = await api.put("/user/update", data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    }
  );
} 