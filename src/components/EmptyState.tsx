import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText: string;
  onAction: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="col-span-full w-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 animate-fade-in">
      <p className="text-gray-500">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      )}
      <Button
        variant="link"
        onClick={onAction}
        className="mt-2"
      >
        {actionText}
      </Button>
    </div>
  );
} 