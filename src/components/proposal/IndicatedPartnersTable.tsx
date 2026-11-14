import { Contact } from "@/types/contact";
import { partnerCategoryLabel } from "@/lib/partner-category";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface IndicatedPartnersTableProps {
  contacts: Contact[];
  selectedIds: string[];
  onToggle: (contactId: string) => void;
}

export function IndicatedPartnersTable({ contacts, selectedIds, onToggle }: IndicatedPartnersTableProps) {
  return (
    <Table className="bg-white rounded-md shadow-lg">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <span className="sr-only">Indicado</span>
          </TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Função</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => {
          const selected = selectedIds.includes(contact.id);
          return (
            <TableRow
              key={contact.id}
              isSelectable
              data-indicated={selected}
              onClick={() => onToggle(contact.id)}
              className={cn(
                "border-l-4",
                selected
                  ? "border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                  : "border-l-transparent hover:bg-gray-50"
              )}
            >
              <TableCell className="w-12">
                <Checkbox
                  checked={selected}
                  aria-label={`Indicar ${contact.name ?? "parceiro"}`}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={() => onToggle(contact.id)}
                  className="border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                />
              </TableCell>
              <TableCell className="font-medium text-gray-900">{contact.name}</TableCell>
              <TableCell>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {partnerCategoryLabel(contact.category)}
                </span>
              </TableCell>
              <TableCell>
                {contact.role ? (
                  <span className="text-sm text-gray-700">{contact.role}</span>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
