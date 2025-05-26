import { api } from '@/lib/axios';
import { NotificationListResponse } from '@/types/notification';

export const notificationService = {
  getAllNotifications: async (venueId: string) => {
    const response = await api.get<NotificationListResponse>(`/notification/list/${venueId}`);
    return response.data;
  },
}; 