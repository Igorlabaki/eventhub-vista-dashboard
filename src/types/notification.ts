export type NotificationType =
  | "VISIT"
  | "EVENT"
  | "OTHER"
  | "BARTER"
  | "PROPOSAL"
  | "OVERNIGHT"
  | "PRODUCTION";

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

export interface NotificationListSummary {
  unread: number;
  last7Days: number;
  last30Days: number;
  newProposals: number;
}

export interface NotificationListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NotificationListQuery {
  q?: string;
  type?: NotificationType;
  isRead?: boolean;
  page: number;
  summary: true;
}

export interface NotificationListResponse {
  success: true;
  message: string;
  data: {
    notificationList: Notification[];
    summary?: NotificationListSummary;
  };
  count: number;
  type: string;
  pagination?: NotificationListPagination;
}

export interface NotificationReadResponse {
  success: true;
  message: string;
  data: { updated: number };
  count: number;
  type: string;
}
