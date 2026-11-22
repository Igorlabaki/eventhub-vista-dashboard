import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VenueDomainView } from "@/lib/venue-domain";

type VenueDomainBlockProps = {
  hostname: string;
  domain: VenueDomainView;
  error: string | null;
  saved: boolean;
  onHostnameChange: (value: string) => void;
  onSave: () => void;
};

export function VenueDomainBlock({
  hostname,
  domain,
  error,
  saved,
  onHostnameChange,
  onSave,
}: VenueDomainBlockProps) {
  return (
    <section data-venue-domain className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-medium">Domínio</h3>
      <div className="space-y-2">
        <Label htmlFor="venue-domain-hostname">Hostname</Label>
        <Input
          id="venue-domain-hostname"
          value={hostname}
          placeholder="www.casa.com"
          onChange={(event) => onHostnameChange(event.target.value)}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onSave}>
        Salvar domínio
      </Button>
      {domain.status === "PENDING" && (
        <div className="space-y-1 text-sm text-gray-600">
          <p>Pendente</p>
          {domain.verification && (
            <p>
              Desafio DNS {domain.verification.type} {domain.verification.name} {domain.verification.value}
            </p>
          )}
          <p>Os links públicos continuam no endereço padrão até o domínio ficar ativo.</p>
        </div>
      )}
      {domain.status === "ACTIVE" && <p className="text-sm text-gray-600">Ativo</p>}
      {saved && domain.status === "PENDING" && (
        <p className="text-sm text-gray-600">Domínio pendente de verificação.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
