import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";

export default function ProposalEventLinkSharePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const link = id ? `${window.location.origin}/proposal/${id}/links` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      showSuccessToast({ title: "Link copiado", description: "O link do evento está na área de transferência." });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Selecione o link e copie manualmente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Link do evento" subtitle="Copie o endereço único deste orçamento">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-medium">Link da página</p>
        <div className="flex gap-2">
          <Input readOnly value={link} aria-label="Link do evento" />
          <Button type="button" variant="outline" onClick={copyLink}>
            Copiar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
