import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithError } from "@/hooks/useMutationWithError";
import { api } from "@/lib/axios";

interface UpdateAvatarParams {
  userId: string;
  file: File;
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutationWithError<unknown, UpdateAvatarParams>(
    async ({ userId, file }: UpdateAvatarParams) => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("file", file);

      const response = await api.put("/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    }
  );
} 