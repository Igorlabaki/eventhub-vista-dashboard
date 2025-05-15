import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  count?: number;
  onCreateClick: () => void;
  createButtonText?: string;
}

export function PageHeader({ 
  title, 
  count, 
  onCreateClick,
  createButtonText = "Novo"
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {title} {count !== undefined && `(${count})`}
      </h2>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        {createButtonText}
      </Button>
    </div>
  );
} 