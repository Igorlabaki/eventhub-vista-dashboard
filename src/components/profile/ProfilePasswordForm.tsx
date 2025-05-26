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
import { useUserStore } from "@/store/userStore";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";

const updatePasswordSchema = z
  .object({
    userId: z.string(),
    currentPassword: z
      .string()
      .min(4, "A senha atual deve ter no mínimo 6 caracteres"),
    newPassword: z
      .string()
      .min(4, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(4, "A confirmação de senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });
  
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function ProfilePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const user = useUserStore((state) => state.user);
  const updatePassword = useUserStore((state) => state.updatePassword);
  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      userId: user?.id || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });
  const { toast } = useToast();

  const handleSubmit = async (values: UpdatePasswordFormValues) => {
    try {
      if (!user?.id) {
        toast({
          title: "Usuário não encontrado",
          description: "Não foi possível encontrar o usuário logado.",
          variant: "destructive",
        });
        return;
      }
      const response = await updatePassword({
        userId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      const { title, message } = handleBackendSuccess(response, "Senha atualizada com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      passwordForm.reset();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar senha. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...passwordForm}>
      <form
        onSubmit={(e) => { e.preventDefault(); }}
        className="space-y-4 mt-2 animate-fade-in"
      >
        <FormField
          control={passwordForm.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha atual</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite sua senha atual"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={passwordForm.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite a nova senha"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={passwordForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <AsyncActionButton
            onClick={() => passwordForm.handleSubmit(handleSubmit)()}
            label="Salvar nova senha"
            type="submit"
          />
        </div>
      </form>
    </Form>
  );
} 