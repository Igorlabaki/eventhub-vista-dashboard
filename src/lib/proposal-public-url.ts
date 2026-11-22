import { useParams } from "react-router-dom";
import { publicShareUrl } from "@/lib/public-venue-links";

export const PROPOSAL_PUBLIC_HOST = "https://event-hub-dashboard.vercel.app";

export const PROPOSAL_CLIENT_SUFFIXES = [
  "evento",
  "convidados",
  "colaboradores",
  "programacao",
  "indicacoes",
  "contrato",
] as const;

export type ProposalClientSuffix = (typeof PROPOSAL_CLIENT_SUFFIXES)[number];

const oldSuffix: Record<ProposalClientSuffix, string> = {
  evento: "links",
  convidados: "guest-list",
  colaboradores: "staff-list",
  programacao: "schedule-list",
  indicacoes: "indications",
  contrato: "person-contract",
};

export const PROPOSAL_CLIENT_PUBLIC_ROUTES = [
  "/espaco/:venueName/orcamento/:ref",
  ...PROPOSAL_CLIENT_SUFFIXES.map((suffix) => `/espaco/:venueName/orcamento/:ref/${suffix}`),
];

export type ProposalClientLink = {
  venueName?: string | null;
  clientName?: string | null;
  publicCode?: string | null;
  proposalId: string;
};

export function proposalPublicLabel(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function proposalClientPath(link: ProposalClientLink, suffix?: ProposalClientSuffix): string {
  const code = link.publicCode?.trim() ?? "";
  const venueName = link.venueName?.trim() ?? "";
  if (!code || !venueName) {
    const tail = suffix ? oldSuffix[suffix] : "view";
    return `/proposal/${link.proposalId}/${tail}`;
  }
  const label = proposalPublicLabel(link.clientName ?? "");
  const ref = label ? `${label}-${code}` : code;
  const base = `/espaco/${encodeURIComponent(venueName)}/orcamento/${ref}`;
  return suffix ? `${base}/${suffix}` : base;
}

export function proposalClientUrl(
  link: ProposalClientLink,
  suffix?: ProposalClientSuffix,
  host = PROPOSAL_PUBLIC_HOST,
  hostname?: string | null,
): string {
  const path = proposalClientPath(link, suffix);
  const code = link.publicCode?.trim() ?? "";
  const venueName = link.venueName?.trim() ?? "";
  if (!code || !venueName) return `${host}${path}`;
  const prefix = `/espaco/${encodeURIComponent(venueName)}`;
  const short = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  return publicShareUrl(path, short, hostname);
}

export function publicContractKind(proposal: { cnpj?: string | null }): "pf" | "pj" {
  return proposal.cnpj?.trim() ? "pj" : "pf";
}

export function proposalKeyMatches(
  proposal: { id: string; publicCode?: string | null } | null | undefined,
  key: string | undefined,
): boolean {
  if (!proposal || !key) return false;
  if (proposal.id === key) return true;
  const code = key.split("-").at(-1);
  return Boolean(proposal.publicCode && code === proposal.publicCode);
}

export function usePublicProposalKey() {
  const { id, ref } = useParams();
  return ref ?? id ?? "";
}
