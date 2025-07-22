import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Calendar, EyeIcon, EyeOffIcon } from "lucide-react";
import { authService } from "@/services/auth.service";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const queryClient = useQueryClient();
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const [isConfirmPasswordHide, setIsConfirmPasswordHide] = useState(true);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação só no front
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não correspondem",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      showSuccessToast({
        title: "Conta criada",
        description: "Sua conta foi criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      navigate("/dashboard");
    } catch (error) {
      const apiError = error?.response?.data;
      toast({
        title: apiError?.title || "Erro ao registrar",
        description: apiError?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eventhub-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-eventhub-primary" />
            <h1 className="text-3xl font-bold text-eventhub-primary">EventHub</h1>
          </div>
          <p className="text-eventhub-primary font-semibold">
            Seu hub central para gestão de eventos
          </p>
        </div>

        <Card className="eventhub-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Criar Conta</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nome completo
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={isPasswordHide ? "password" : "text"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {!isPasswordHide ? (
                    <EyeIcon
                      className="w-4 h-4 text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setIsPasswordHide(!isPasswordHide)}
                    />
                  ) : (
                    <EyeOffIcon
                      className="w-4 h-4 text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setIsPasswordHide(!isPasswordHide)}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isPasswordHide ? "password" : "text"}
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-eventhub-primary hover:bg-indigo-600"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                  OU
                </span>
              </div>
              <div className="flex justify-center items-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setIsLoading(true);
                    try {
                      // Decodifica o token JWT do Google
                      const [header, payload, signature] =
                        credentialResponse.credential.split(".");
                      const userData = JSON.parse(atob(payload));

                      const apiResponse = await authService.loginWithGoogle({
                        googleToken: credentialResponse.credential,
                        userData: {
                          email: userData.email,
                          name: userData.name,
                          googleId: userData.sub,
                          picture: userData.picture,
                          password: credentialResponse.credential,
                        },
                      });

                      localStorage.setItem(
                        "@EventHub:token",
                        apiResponse.accessToken
                      );
                      localStorage.setItem(
                        "@EventHub:session",
                        JSON.stringify(apiResponse.session)
                      );

                      queryClient.invalidateQueries({ queryKey: ["user"] });
                      queryClient.invalidateQueries({
                        queryKey: ["organizations"],
                      });
                      navigate("/dashboard");
                    } catch (error) {
                      toast({
                        title: "Erro ao fazer login com Google",
                        description: "Tente novamente mais tarde.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  onError={() => {
                    toast({
                      title: "Erro",
                      description: "Falha ao fazer login com Google",
                      variant: "destructive",
                    });
                  }}
                  useOneTap
                />
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Já tem uma conta?</span>{" "}
              <button
                onClick={goToLogin}
                className="text-eventhub-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
