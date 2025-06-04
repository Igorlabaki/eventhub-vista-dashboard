import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SeasonalFee } from "@/types/seasonalFee";
import { FeeItem } from "./fee-item";

interface FeeListProps {
  fees: SeasonalFee[];
  traduzirDiasSemana: (dias: string) => string;
  onEdit: (fee: SeasonalFee) => void;
  onDelete: (fee: SeasonalFee) => void;
}

export function FeeList({ fees, traduzirDiasSemana, onEdit, onDelete }: FeeListProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Título</TableHead>
              <TableHead className="font-medium text-center">Adicional</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <FeeItem
                key={fee.id}
                fee={fee}
                traduzirDiasSemana={traduzirDiasSemana}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 