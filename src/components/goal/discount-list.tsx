import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscountItem } from "./discount-item";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface Discount {
  id: string;
  type: string;
  title: string;
  fee: number;
  startDay?: string;
  endDay?: string;
  affectedDays?: string;
}

interface DiscountListProps {
  discounts: Discount[];
  traduzirDiasSemana: (dias: string) => string;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

export function DiscountList({ discounts, traduzirDiasSemana, onEdit, onDelete }: DiscountListProps) {
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
   
  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_VENUE_PRICES");
  };
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Título</TableHead>
              <TableHead className="font-medium text-center">Desconto</TableHead>
              {hasEditPermission() && (
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <DiscountItem
                hasEditPermission={hasEditPermission()}
                key={discount.id}
                discount={discount}
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