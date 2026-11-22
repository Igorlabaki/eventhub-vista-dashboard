import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareHostOf } from "@/lib/public-venue-links";
import type { VenueDomainView } from "@/lib/venue-domain";

const DEFAULT_PUBLIC_HOST = "https://event-hub-dashboard.vercel.app";

const HOUSE_PATHS = [
  "/links",
  "/apresentacao",
  "/formulario",
  "/regras",
  "/parceiro",
  "/colaborador",
] as const;

type VenueDomainBlockProps = {
  hostname: string;
  venueName: string;
  domain: VenueDomainView;
  error: string | null;
  saved: boolean;
  removed: boolean;
  onHostnameChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
};

export function venueDomainRedirects(venueName: string, shareHost: string) {
  const key = encodeURIComponent(venueName);
  const rows = HOUSE_PATHS.map((path) => ({
    from: `https://${shareHost}${path}`,
    to: `${DEFAULT_PUBLIC_HOST}/espaco/${key}${path}`,
  }));
  rows.push({
    from: `https://${shareHost}/orcamento/{codigo}`,
    to: `${DEFAULT_PUBLIC_HOST}/espaco/${key}/orcamento/{codigo}`,
  });
  return rows;
}

export function VenueDomainBlock({
  hostname,
  venueName,
  domain,
  error,
  saved,
  removed,
  onHostnameChange,
  onSave,
  onRemove,
}: VenueDomainBlockProps) {
  const shareHost = shareHostOf(domain);
  const redirects = shareHost && venueName ? venueDomainRedirects(venueName, shareHost) : [];

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
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onSave}>
          Salvar domínio
        </Button>
        {shareHost && (
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            Retirar domínio
          </Button>
        )}
      </div>
      {redirects.length > 0 && (
        <div className="space-y-2 text-sm text-gray-600">
          <p>Crie estes redirects no provedor do domínio. A home do site continua onde está.</p>
          <ul className="space-y-1">
            {redirects.map((row) => (
              <li key={row.from}>
                {row.from} → {row.to}
              </li>
            ))}
          </ul>
        </div>
      )}
      {saved && shareHost && (
        <p className="text-sm text-gray-600">Hostname salvo. Os links públicos passam a usar esse domínio.</p>
      )}
      {removed && !shareHost && (
        <p className="text-sm text-gray-600">Domínio retirado. Os links públicos voltaram às URLs padrão.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
