import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { api } from "@/lib/axios";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: values.email });
      showSuccessToast({
        description:
          "Se o e-mail existir, enviaremos instruções para redefinir a senha.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro ao solicitar redefinição",
        description:
          (error)?.response?.data?.message ||
          "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-eventhub-background p-4">
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
            <CardTitle className="text-center">Redefinir senha</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
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
                <SubmitButton loading={isLoading} className="w-full">
                  Enviar instruções
                </SubmitButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
