import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { formState: { isSubmitting } } = useFormContext();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
} 