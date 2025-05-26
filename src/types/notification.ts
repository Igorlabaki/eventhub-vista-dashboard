export type NotificationType =
  | 'VISIT'
  | 'EVENT'
  | 'OTHER'
  | 'BARTER'
  | 'PROPOSAL'
  | 'OVERNIGHT'
  | 'PRODUCTION';

export interface Notification {
  id: string;
  venueId: string;
  proposalId?: string | null;
  dateEventId?: string | null;
  content: string;
  type: NotificationType;
  createdAt: Date;
  isRead: boolean;
}

export interface NotificationListResponse {
  success: true;
  message: string;
  data: {
    notificationList: Notification[];
  };
  count: number;
  type: string;
} 