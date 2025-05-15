import { toast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";

interface SuccessToastProps {
  title?: string;
  description: string;
  duration?: number;
}

export function showSuccessToast({
  title ,
  description,
  duration = 3500,
}: SuccessToastProps) {
  toast({
    title,
    description: (
      <span className="flex items-center gap-2">
        <CheckCircle className="text-green-500" size={20} />
        {description}
      </span>
    ),
    variant: "default",
    duration,
  });
}