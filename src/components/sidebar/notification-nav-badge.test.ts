import { LayoutDashboard, Bell } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  notificationBadgeLabel,
  venueUnreadNotificationsQuery,
  withNotificationBadge,
} from "./notification-nav-badge";
import type { PresentedNavItem } from "./sidebar-nav-model";

const items: PresentedNavItem[] = [
  { title: "Visão Geral", href: "/venue/1", icon: LayoutDashboard },
  { title: "Notificações", href: "/venue/1/notifications", icon: Bell },
];

describe("bolinha de nao lidas na sidebar", () => {
  it("conta o espaco inteiro, sem busca, tipo ou filtro de leitura", () => {
    expect(venueUnreadNotificationsQuery).toEqual({ page: 1, summary: true });
    expect(venueUnreadNotificationsQuery).not.toHaveProperty("q");
    expect(venueUnreadNotificationsQuery).not.toHaveProperty("type");
    expect(venueUnreadNotificationsQuery).not.toHaveProperty("isRead");
  });

  it("nao coloca bolinha com zero e so no item Notificacoes", () => {
    expect(withNotificationBadge(items, 0)).toBe(items);
    const marked = withNotificationBadge(items, 4);
    expect(marked[0].badge).toBeUndefined();
    expect(marked[1].badge).toBe(4);
  });

  it("abrevia a partir de 100", () => {
    expect(notificationBadgeLabel(1)).toBe("1");
    expect(notificationBadgeLabel(99)).toBe("99");
    expect(notificationBadgeLabel(100)).toBe("99+");
  });
});
