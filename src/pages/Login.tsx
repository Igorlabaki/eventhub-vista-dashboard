import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";

import { z } from "zod";
import { authService } from "@/services/auth.service";
import { showSuccessToast } from "@/components/ui/success-toast";

// Schema de validação
const loginSchema = z.object({
  email: z
    .string()
    .email("O campo 'email' deve ser um e-mail válido")
    .min(6, "O campo 'email' é obrigatório")
    .refine((value) => typeof value === "string" && isNaN(Number(value)), {
      message: "O campo 'email' não pode ser um número",
    }),
  password: z.string().min(1, "Este campo é obrigatório"),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("@EventHub:token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro do campo quando ele é alterado
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validação com Zod
      loginSchema.parse(formData);

      const response = await authService.login(formData);

      showSuccessToast({
        title: "Login realizado",
        description: "Bem-vindo ao EventHub!",
      });

      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eventhub-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-eventhub-primary" />
            <h1 className="text-3xl font-bold text-gray-900">EventHub</h1>
          </div>
          <p className="text-gray-600">
            Seu hub central para gestão de eventos
          </p>
        </div>

        <Card className="eventhub-card">
          <CardHeader>
            <CardTitle className="text-center">Entrar</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-eventhub-primary hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-eventhub-primary hover:bg-indigo-600"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
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
              <span className="text-gray-600">Não tem uma conta?</span>{" "}
              <button
                onClick={goToRegister}
                className="text-eventhub-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
