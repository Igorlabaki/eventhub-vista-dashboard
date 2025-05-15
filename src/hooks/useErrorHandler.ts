import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      // Tenta extrair o erro no formato esperado
      const apiError = error.response?.data;

      // Se vier no formato esperado, usa title e message
      if (apiError && apiError.title && apiError.message) {
        toast({
          title: apiError.title,
          description: apiError.message,
          variant: "destructive",
          duration: 3500,
        });
      } else {
        // fallback para erros inesperados
        const message = error.response?.data?.message || error.message || 'Erro interno do servidor';
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
          duration: 3500,
        });
      }
    } else {
      // fallback para erros que não são AxiosError
      toast({
        title: "Erro",
        description: "Erro desconhecido",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  return { handleError };
} 