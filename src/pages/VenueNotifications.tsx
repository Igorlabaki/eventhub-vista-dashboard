import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationListSummaryCards } from "@/components/notification/notification-list-summary";
import { ProposalListPager } from "@/components/proposal/ProposalListPager";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetNotificationsList } from "@/hooks/notification/queries/list";
import { notificationService } from "@/services/notification.service";
import { NotificationType } from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const typeOptions: { value: "" | NotificationType; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "VISIT", label: "Visita" },
  { value: "EVENT", label: "Evento" },
  { value: "OTHER", label: "Outro" },
  { value: "BARTER", label: "Permuta" },
  { value: "PROPOSAL", label: "Orçamento" },
  { value: "OVERNIGHT", label: "Pernoite" },
  { value: "PRODUCTION", label: "Produção" },
];

function listErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Não foi possível carregar as notificações.";
  }
  return "Não foi possível carregar as notificações.";
}

export default function VenueNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: venueId = "" } = useParams<{ id: string }>();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<"" | NotificationType>("");
  const [readFilter, setReadFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [markError, setMarkError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchInput.trim();
      setSearchTerm((current) => {
        if (current !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const listQuery = useGetNotificationsList(venueId, {
    q: searchTerm || undefined,
    type: type || undefined,
    isRead: readFilter === "" ? undefined : readFilter === "true",
    page,
    summary: true,
  });

  const notifications = listQuery.data?.data.notificationList ?? [];
  const summary = listQuery.data?.data.summary ?? null;
  const pagination = listQuery.data?.pagination;

  useEffect(() => {
    if (!pagination) return;
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [pagination, page]);

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(venueId),
    onSuccess: async () => {
      setMarkError(null);
      await queryClient.invalidateQueries({ queryKey: ["notifications", venueId] });
    },
    onError: (error: unknown) => {
      setMarkError(listErrorMessage(error));
    },
  });

  const handleNotificationClick = (proposalId?: string | null) => {
    if (proposalId) {
      navigate(`/proposal/${proposalId}`);
    }
  };

  return (
    <DashboardLayout title="Notificações" subtitle="Mantenha-se atualizado">
      <div className="space-y-4">
        <NotificationListSummaryCards summary={summary} />

        <div className="rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar notificação..."
                className="h-10 rounded-full bg-white pl-9"
              />
            </div>
            <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
              Tipo
              <select
                aria-label="Tipo"
                className="bg-transparent pr-1 outline-none"
                value={type}
                onChange={(event) => {
                  setType(event.target.value as "" | NotificationType);
                  setPage(1);
                }}
              >
                {typeOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
              Leitura
              <select
                aria-label="Leitura"
                className="bg-transparent pr-1 outline-none"
                value={readFilter}
                onChange={(event) => {
                  setReadFilter(event.target.value as "" | "true" | "false");
                  setPage(1);
                }}
              >
                <option value="">Todas</option>
                <option value="false">Não lidas</option>
                <option value="true">Lidas</option>
              </select>
            </label>
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 rounded-full"
              disabled={markAll.isPending || !venueId}
              onClick={() => markAll.mutate()}
            >
              Marcar todas como lidas
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {pagination?.total ?? 0} notificações
        </div>

        {(listQuery.isError || markError) && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{markError || listErrorMessage(listQuery.error)}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => listQuery.refetch()}>
              Tentar de novo
            </Button>
          </div>
        )}

        {listQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className="bg-white hover:bg-gray-100 transition-colors cursor-pointer border shadow-sm"
              onClick={() => handleNotificationClick(notification.proposalId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-eventhub-tertiary/30 p-2 rounded-full mt-1">
                    <Bell className="h-5 w-5 text-eventhub-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{notification.content}</p>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>
                        Criada em {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      {!notification.isRead && (
                        <span className="bg-eventhub-primary text-white text-xs px-2 py-0.5 rounded-full">
                          Novo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !listQuery.isError && (
            <EmptyState
              hasEditPermission={false}
              title="Sem notificações"
              description="Você não possui notificações no momento."
              actionText="Atualizar"
              onAction={() => listQuery.refetch()}
            />
          )
        )}

        <ProposalListPager
          page={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
