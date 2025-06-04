import * as React from "react"
import { cn } from "@/lib/utils"
import { FilterList } from "@/components/filterList"
import { EmptyState } from "@/components/EmptyState"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ServiceListSkeleton } from "./service-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Service } from "@/types/service"
import { useServiceStore } from "@/store/serviceStore"
import { showSuccessToast } from "@/components/ui/success-toast"
import { useToast } from "@/hooks/use-toast"
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler"

interface ServiceListProps {
  services: Service[]
  onDeleteService?: (service: Service) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  selectedServiceIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (service: Service) => void
}

export function ServiceList({
  services,
  onDeleteService,
  searchPlaceholder = "Filtrar serviços...",
  emptyMessage = "Nenhum serviço encontrado",
  className,
  selectedServiceIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: ServiceListProps) {
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);
  const { deleteService } = useServiceStore();
  const { toast } = useToast();

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await deleteService(serviceId);
      const { title, message } = handleBackendSuccess(response, "Serviço excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setServiceToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir serviço. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <ServiceListSkeleton />;
  }

  return (
    <>
      {/* Botão web no topo direito */}
      <div className="hidden md:flex justify-end mb-4">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[#8854D0] text-white font-medium px-5 py-2 rounded-lg shadow hover:bg-[#6c3fc9] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Serviço
        </button>
      </div>

      <div className={cn("space-y-4", className)}>
        <FilterList
          items={services}
          filterBy={(service, query) =>
            service.name.toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredServices) =>
            filteredServices?.length === 0 ? (
              <EmptyState
                title={emptyMessage}
                actionText="Novo Serviço"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Serviço</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow 
                      key={service.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedServiceIds.includes(service.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => onEditClick(service)}
                      >
                        {service.name}
                      </TableCell>
                      <TableCell>
                        R$ {service.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(service);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceToDelete(service);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
        </FilterList>
      </div>
      <ConfirmDeleteDialog
        open={!!serviceToDelete}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
        onConfirm={async () => {
          if (serviceToDelete) {
            await handleDelete(serviceToDelete.id);
          }
        }}
        entityName={serviceToDelete?.name || ""}
        entityType="serviço"
        isPending={isDeleting}
      />
    </>
  )
} 