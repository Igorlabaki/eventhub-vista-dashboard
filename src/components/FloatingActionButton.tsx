
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  label = "Novo Orçamento",
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 flex items-center gap-2 py-3 px-4 rounded-full bg-eventhub-primary text-white shadow-lg hover:bg-indigo-600 transition-colors",
        "animate-fade-in",
        className
      )}
    >
      <Plus className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}
