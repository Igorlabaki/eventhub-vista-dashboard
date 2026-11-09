import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";
import { wallClockDateBr } from "@/lib/wall-clock-datetime";
import { ArrowUpDown } from "lucide-react";

type SortKey = "startDate" | "totalAmount" | "status";

interface ProposalTableProps {
  proposals: Proposal[];
  isLoading: boolean;
  monthNames: string[];
  selectedMonth: number;
  selectedYear: number;
  sortBy: SortKey;
  sortDir: "asc" | "desc";
  onSort: (sortBy: SortKey) => void;
  kind?: "budgets" | "events";
  showAmount?: boolean;
}

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function StatusBadge({ status }: { status?: Proposal["status"] }) {
  const closed = status === "FECHADO";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${closed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${closed ? "bg-green-500" : "bg-amber-500"}`} />
      {closed ? "Fechado" : "Aberto"}
    </span>
  );
}

const TableSkeleton = ({ showAmount, showStatus }: { showAmount: boolean; showStatus: boolean }) => (
  <div className="rounded-2xl border bg-white">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Data do Evento</TableHead>
          {showAmount && <TableHead className="text-right">Valor Total</TableHead>}
          {showStatus && <TableHead>Status</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            {showAmount && <TableCell><Skeleton className="ml-auto h-4 w-[120px]" /></TableCell>}
            {showStatus && <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export function ProposalTable({
  proposals,
  isLoading,
  monthNames,
  selectedMonth,
  selectedYear,
  sortBy,
  sortDir,
  onSort,
  kind = "budgets",
  showAmount = true,
}: ProposalTableProps) {
  const showStatus = kind === "budgets";
  const emptyLabel = kind === "events" ? "Nenhum evento encontrado" : "Nenhum orçamento encontrado";
  const columnCount = 2 + (showAmount ? 1 : 0) + (showStatus ? 1 : 0);

  const handleProposalClick = (proposalId: string) => {
    const proposalUrl = `${window.location.origin}/proposal/${proposalId}`;
    window.open(proposalUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) return <TableSkeleton showAmount={showAmount} showStatus={showStatus} />;

  const sortLabel = (key: SortKey, label: string, alignRight = false) => (
    <button
      type="button"
      className={`inline-flex items-center gap-1 ${alignRight ? "ml-auto" : ""}`}
      aria-sort={sortBy === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      onClick={() => onSort(key)}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <div className="rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>{sortLabel("startDate", "Data do Evento")}</TableHead>
            {showAmount && <TableHead className="text-right">{sortLabel("totalAmount", "Valor Total", true)}</TableHead>}
            {showStatus && <TableHead>{sortLabel("status", "Status")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <TableRow
                key={proposal.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleProposalClick(proposal.id)}
              >
                <TableCell className="max-w-[220px] font-medium">{proposal.completeClientName}</TableCell>
                <TableCell>{wallClockDateBr(proposal.startDate)}</TableCell>
                {showAmount && <TableCell className="text-right">{money.format(proposal.totalAmount)}</TableCell>}
                {showStatus && <TableCell><StatusBadge status={proposal.status} /></TableCell>}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                {emptyLabel} para {monthNames[selectedMonth]}/{selectedYear}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
