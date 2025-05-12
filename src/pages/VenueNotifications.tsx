
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function VenueNotifications() {
  // Mock data for notifications
  const notifications = [
    {
      id: "1",
      title: "Novo orçamento de Daniela Paradiso",
      value: "R$ 16.767",
      date: "20/12/2025",
      read: false,
    },
    {
      id: "2",
      title: "Novo orçamento de Caroline",
      value: "R$ 5.247",
      date: "17/05/2025",
      read: false,
    },
    {
      id: "3",
      title: "Novo orçamento de Fernanda Silva",
      value: "R$ 4.540",
      date: "19/07/2025",
      read: false,
    },
    {
      id: "4",
      title: "Novo orçamento de João Vitor",
      value: "R$ 11.500",
      date: "18/10/2025",
      read: false,
    },
    {
      id: "5",
      title: "Novo orçamento de Raisa Jamille",
      value: "R$ 1.590",
      date: "08/06/2025",
      read: false,
    },
  ];

  return (
    <DashboardLayout title="Notificações" subtitle="Mantenha-se atualizado">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-800 p-2 rounded-full mt-1">
                  <Bell className="h-5 w-5 text-eventhub-primary" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{notification.title}</p>
                  <div className="flex justify-between text-sm text-gray-300 mt-1">
                    <span>no valor de {notification.value}, para {notification.date}</span>
                    {!notification.read && (
                      <span className="bg-eventhub-primary text-black text-xs px-2 py-0.5 rounded-full">
                        Novo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Sem notificações</h3>
            <p className="text-gray-500">
              Você não possui notificações no momento.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
