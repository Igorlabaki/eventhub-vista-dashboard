import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ButtonProps } from "@/components/ui/button";

export function AsyncActionButton({
  onClick,
  children,
  label,
  ...props
}: {
  onClick: () => Promise<unknown>;
  children?: React.ReactNode;
  label?: string;
} & ButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`
        bg-violet-500
        hover:bg-violet-600
        active:bg-violet-700
        text-white
        font-semibold
        shadow-md
        rounded-md
        px-6
        py-2
        transition-all
        duration-200
        ease-in-out
        hover:scale-105
        active:scale-95
        ${loading && "opacity-50 cursor-wait"}
      `}
      {...props}
    >
      {loading ? "Salvando..." : label ? label : children}
    </Button>
  );
} 