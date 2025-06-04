import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GoalListSkeleton() {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <Table className="bg-white rounded-lg shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Meta</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-8 w-8 mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 