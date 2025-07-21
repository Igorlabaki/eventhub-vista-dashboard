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
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface FeeListProps {
  fees: SeasonalFee[];
  traduzirDiasSemana: (dias: string) => string;
  onEdit: (fee: SeasonalFee) => void;
  onDelete: (fee: SeasonalFee) => void;
}

export function FeeList({ fees, traduzirDiasSemana, onEdit, onDelete }: FeeListProps) {
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
              <TableHead className="font-medium text-center">Adicional</TableHead>
              {hasEditPermission() && (
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <FeeItem
                hasEditPermission={hasEditPermission()}
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