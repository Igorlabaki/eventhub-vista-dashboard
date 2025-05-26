import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useUserStore } from "@/store/userStore";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";

const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  username: z.string().min(2, "Nome de usuário obrigatório").optional(),
  avatarUrl: z.string().optional(),
});
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function ProfileUserForm() {
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const { toast } = useToast();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      userId: user?.id || "",
      email: user?.email || "",
      username: user?.username || "",
      avatarUrl: user?.avatarUrl || "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (values: UpdateUserFormValues) => {
    try {
      const response = await updateUser({
        userId: user?.id || "",
        email: values.email,
        username: values.username,
      });
      const { title, message } = handleBackendSuccess(response, "Perfil atualizado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar perfil. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <Input
                  placeholder="Seu nome de usuário"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 mt-6">
          <AsyncActionButton
            onClick={() => form.handleSubmit(handleSubmit)()}
            type="submit"
          >
            Salvar Alterações
          </AsyncActionButton>
        </div>
      </form>
    </Form>
  );
} 