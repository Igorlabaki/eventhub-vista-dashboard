import { notificationService } from "@/services/notification.service";
import { NotificationListQuery } from "@/types/notification";
import { useQuery } from "@tanstack/react-query";

export const useGetNotificationsList = (venueId: string, query: NotificationListQuery) => {
  return useQuery({
    queryKey: ["notifications", venueId, query],
    queryFn: () => notificationService.getAllNotifications(venueId, query),
    enabled: !!venueId,
    staleTime: 1000 * 60 * 5,
  });
};
