import { notificationService } from '@/services/notification.service';
import { useQuery } from '@tanstack/react-query';

export const useGetNotificationsList = (venueId: string) => {
  return useQuery({
    queryKey: ['notifications', venueId],
    queryFn: () => notificationService.getAllNotifications(venueId),
    select: (data) => data.data.notificationList,
    enabled: !!venueId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}; 