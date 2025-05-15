import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorPage({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
  actionLabel = "Voltar para o início",
  onAction,
}: ErrorPageProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-2" />
        <h1 className="text-2xl font-bold text-gray-800 text-center">{title}</h1>
        <p className="text-gray-600 text-center">{message}</p>
        <Button
          className="mt-4"
          onClick={onAction || (() => navigate("/"))}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
} 