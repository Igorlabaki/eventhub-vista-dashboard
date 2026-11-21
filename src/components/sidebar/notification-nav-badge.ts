import type { NotificationListQuery } from "@/types/notification";
import type { PresentedNavItem } from "./sidebar-nav-model";

/** Contagem do espaco inteiro, sem busca, tipo ou filtro de leitura da pagina. */
export const venueUnreadNotificationsQuery: NotificationListQuery = {
  page: 1,
  summary: true,
};

export function notificationBadgeLabel(count: number): string {
  return count > 99 ? "99+" : String(Math.trunc(count));
}

export function withNotificationBadge(items: PresentedNavItem[], unread: number): PresentedNavItem[] {
  if (!Number.isFinite(unread) || unread <= 0) return items;
  return items.map((item) => (item.title === "Notificações" ? { ...item, badge: Math.trunc(unread) } : item));
}
