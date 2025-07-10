import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGetNotificationsList } from "@/hooks/notification/queries/list";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState } from "@/components/EmptyState";
import { FilterList } from "@/components/filterList";
import { Skeleton } from "@/components/ui/skeleton";

export default function VenueNotifications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: venueId } = useParams<{ id: string }>();

  const { data: notifications = [], isLoading } = useGetNotificationsList(venueId);

  useEffect(() => {
    const notificationId = searchParams.get('notification');
    if (notificationId && notifications.length > 0) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        // Exemplo: navegação para orçamento relacionado, se existir
        // handleNotificationClick(notification.proposalId);
      }
    }
  }, [searchParams, notifications]);

  // Exemplo de navegação ao clicar (ajuste conforme sua regra)
  const handleNotificationClick = (proposalId?: string) => {
    if (proposalId) {
      navigate(`/proposal/${proposalId}`);
    }
  };

  return (
    <DashboardLayout title="Notificações" subtitle="Mantenha-se atualizado">
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : (
          <FilterList
            items={notifications}
            filterBy={(item, query) =>
              item.content.toLowerCase().includes(query.toLowerCase())
            }
            placeholder="Buscar notificação..."
          >
            {(filtered) =>
              filtered.length > 0 ? (
                filtered.map((notification) => (
                  <Card
                    key={notification.id}
                    className="bg-white hover:bg-gray-100 transition-colors cursor-pointer border shadow-sm mt-2"
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
                <EmptyState
                  title="Sem notificações"
                  description="Você não possui notificações no momento."
                  actionText="Atualizar"
                  onAction={() => window.location.reload()}
                />
              )
            }
          </FilterList>
        )}
      </div>
    </DashboardLayout>
  );
}
