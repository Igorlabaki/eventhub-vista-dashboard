import { cn } from "@/lib/utils";

interface AnimatedFormSwitcherProps {
  showForm: boolean;
  list: React.ReactNode;
  form: React.ReactNode;
  className?: string;
}

export function AnimatedFormSwitcher({ showForm, list, form, className = "" }: AnimatedFormSwitcherProps) {
  return (
    <>
      {/* Lista */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out mb-0 pb-0",
          !showForm ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"
        )}
      >
        {list}
      </div>
      {/* Formulário */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-full",
          showForm ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"
        )}
      >
        {form}
      </div>
    </>
  );
} 