import { useState } from "react";
import { useUser } from "@/hooks/user/queries/byId";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/Header";
import { SidebarNav } from "@/components/SidebarNav";
import { ArrowLeft, Camera, CheckCircle, Mail, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileAvatarModal } from "@/components/profile/ProfileAvatarModal";
import { useUpdateAvatar } from "@/hooks/user/mutations/updateAvatar";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ErrorPage } from "@/components/ErrorPage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateUser } from "@/hooks/user/mutations/updateUser";
import { SubmitButton } from "@/components/ui/submit-button";
import { useUpdatePassword } from "@/hooks/user/mutations/updatePassword";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { showSuccessToast } from "@/components/ui/success-toast";

const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  googleId: z.string().optional(),
  username: z.string().min(2, "Nome de usuário obrigatório").optional(),
  avatarUrl: z.string().optional(),
});
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

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

export default function Profile() {
  const { data: user, isLoading } = useUser();
  const { toast } = useToast();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      userId: user?.id || "",
      email: user?.email || "",
      googleId: user?.googleId || "",
      username: user?.username || "",
      avatarUrl: user?.avatarUrl || "",
    },
    mode: "onBlur",
  });

  const { mutateAsync: updateAvatar, isPending: isUploading } =
    useUpdateAvatar();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const [showPasswordForm, setShowPasswordForm] = useState(false);

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
  const { mutateAsync: updatePassword, isPending: isPasswordPending } =
    useUpdatePassword();

  const onSubmit = async (values) => {
    try {
      await updateUser(values);
      showSuccessToast({
        title: "Perfil atualizado",
        description: "Sua informações foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarSave = async (file: File) => {
    try {
      await updateAvatar({ userId: user.id, file });
      showSuccessToast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua foto de perfil.",
        variant: "destructive",
      });
    }
  };

  const onSubmitPassword = (values: UpdatePasswordFormValues) => {
    if (!user?.id) {
      toast({
        title: "Erro ao alterar senha",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }
    updatePassword(
      {
        userId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => {
          showSuccessToast({
            title: "Senha alterada",
            description: "Sua senha foi atualizada com sucesso!",
          });
          passwordForm.reset();
          setShowPasswordForm(false);
        },
      }
    );
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!user)
    return (
      <ErrorPage
        title="Usuário não encontrado"
        message="Não foi possível encontrar as informações do usuário."
      />
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNav />
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais"
        />
        <div className="flex-1 p-8 overflow-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex justify-center items-center md:justify-start md:items-start">
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e como os outros te veem na
                  plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <Avatar
                      className="h-32 w-32 mb-4 cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setIsAvatarModalOpen(true)}
                    >
                      <AvatarImage
                        src={user.avatarUrl || ""}
                        alt={user.username}
                      />
                      <AvatarFallback className="text-3xl">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
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
                      <SubmitButton loading={isPending}>
                        Salvar Alterações
                      </SubmitButton>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Conta</CardTitle>
                <CardDescription>
                  Gerencie suas preferências e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Collapsible>
                  <div className="">
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start mb-2"
                        onClick={() => setShowPasswordForm((v) => !v)}
                      >
                        Alterar Senha
                      </Button>
                    </CollapsibleTrigger>
                    {showPasswordForm && (
                      <CollapsibleContent>
                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm.handleSubmit(
                              onSubmitPassword
                            )}
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
                              <SubmitButton loading={isPasswordPending}>
                                Salvar nova senha
                              </SubmitButton>
                            </div>
                          </form>
                        </Form>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
                <Button variant="destructive" className="w-full justify-start">
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        username={user.username}
        onSave={handleAvatarSave}
      />
    </div>
  );
}
