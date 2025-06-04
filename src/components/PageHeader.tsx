import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  count?: number;
  onCreateClick: () => void;
  createButtonText?: string;
  isFormOpen: boolean;
}

export function PageHeader({ 
  count, 
  onCreateClick,
  createButtonText = "Novo",
  isFormOpen
}: PageHeaderProps) {
  return (
    <div className="flex justify-start items-center mb-6 w-full">
      {!isFormOpen && (
        <Button onClick={onCreateClick} className="shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 hidden md:block">
          {createButtonText}
        </Button>
      )}
      {/* Botão flutuante mobile */}
      {!isFormOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onCreateClick}
          aria-label={createButtonText}
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
} 