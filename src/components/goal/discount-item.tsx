import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

interface Discount {
  id: string;
  type: string;
  title: string;
  fee: number;
  startDay?: string;
  endDay?: string;
  affectedDays?: string;
}

interface DiscountItemProps {
  discount: Discount;
  hasEditPermission: boolean;
  traduzirDiasSemana: (dias: string) => string;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

export function DiscountItem({
  discount,
  traduzirDiasSemana,
  hasEditPermission,
  onEdit,
  onDelete,
}: DiscountItemProps) {
  return (
    <TableRow
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onEdit(discount)}
    >
      <TableCell className="font-medium">{discount.title}</TableCell>
      <TableCell className="text-red-600 font-semibold text-center">
        - {discount.fee}%
      </TableCell>
      {hasEditPermission && (
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(discount);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(discount);
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
