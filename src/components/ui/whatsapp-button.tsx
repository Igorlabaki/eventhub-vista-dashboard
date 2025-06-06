import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export function WhatsAppButton({ onClick, label, disabled }: WhatsAppButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#26cc63] hover:bg-[#128C7E] text-white shadow-md hover:scale-105 transition-all duration-200 active:scale-95"
    >
      <FaWhatsapp width={10} height={10}/>
      {label}
    </Button>
  );
} 