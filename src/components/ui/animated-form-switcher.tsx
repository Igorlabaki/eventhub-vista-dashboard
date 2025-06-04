import { cn } from "@/lib/utils";

interface AnimatedFormSwitcherProps {
  showForm: boolean;
  list: React.ReactNode;
  form: React.ReactNode;
  className?: string;
}

export function AnimatedFormSwitcher({ showForm, list, form, className = "" }: AnimatedFormSwitcherProps) {
  return (
    <div className={cn("relative flex justify-center", className)}>
      {/* Lista */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out w-full",
          !showForm ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
        )}
      >
        {list}
      </div>
      {/* Formulário */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out w-full",
          showForm ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
        )}
      >
        {form}
      </div>
    </div>
  );
} 