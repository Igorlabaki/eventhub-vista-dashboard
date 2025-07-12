import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

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
    <>
      <div className="flex justify-start items-center mb-6 w-full">
        {!isFormOpen && (
          <Button onClick={onCreateClick} className="shadow-lg flex-row items-center gap-2 bg-eventhub-primary hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 hidden md:flex">
            <Plus className="w-7 h-7" />
            <p>{createButtonText}</p>
          </Button>
        )}
      </div>
      {/* Botão flutuante mobile via Portal para ficar sempre fixo no viewport */}
      {!isFormOpen && createPortal(
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-600 text-white rounded-full shadow-2xl p-4 flex items-center justify-center transition-all duration-200"
          onClick={onCreateClick}
          aria-label={createButtonText}
        >
          <Plus className="w-7 h-7" />
        </button>,
        document.body
      )}
    </>
  );
} 