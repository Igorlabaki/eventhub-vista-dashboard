import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { SeasonalFee } from "@/types/seasonalFee";

interface FeeItemProps {
  fee: SeasonalFee;
  traduzirDiasSemana: (dias: string) => string;
  onEdit: (fee: SeasonalFee) => void;
  onDelete: (fee: SeasonalFee) => void;
  hasEditPermission: boolean;
}

export function FeeItem({
  fee,
  traduzirDiasSemana,
  hasEditPermission,
  onEdit,
  onDelete,
}: FeeItemProps) {
  const hasPeriodo = !!(fee.startDay && fee.endDay);
  const hasDiasAfetados = !!fee.affectedDays && !hasPeriodo;
 
  return (
    <TableRow
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onEdit(fee)}
    >
      <TableCell className="font-medium">{fee.title}</TableCell>
      <TableCell className="text-green-600 font-semibold text-center">+ {fee.fee}%</TableCell>
      {hasEditPermission && ( 
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit(fee);
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              if (onDelete) onDelete(fee);
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
      )}
    </TableRow>
  );
}
