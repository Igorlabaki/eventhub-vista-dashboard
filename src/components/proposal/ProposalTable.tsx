import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Proposal } from "@/types/proposal";

interface ProposalTableProps {
  proposals: Proposal[];
  isLoading: boolean;
  monthNames: string[];
  selectedMonth: number;
  selectedYear: number;
}

const TableSkeleton = () => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data do Evento</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[120px] ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export function ProposalTable({
  proposals,
  isLoading,
  monthNames,
  selectedMonth,
  selectedYear,
}: ProposalTableProps) {
  const handleProposalClick = (proposalId: string) => {
    const baseUrl = window.location.origin;
    const proposalUrl = `${baseUrl}/proposal/${proposalId}`;
    window.open(proposalUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data do Evento</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
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
                <TableCell className="font-medium max-w-[120px]">{proposal.completeClientName}</TableCell>
                <TableCell>
                  {format(proposal.startDate, "dd/MM/yyyy", {
                    locale: pt
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(proposal.totalAmount)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Nenhum orçamento encontrado para {monthNames[selectedMonth]}/{selectedYear}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 