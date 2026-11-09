import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  itemsWhenCollapsed,
  type CollapsedNavMode,
  type PresentedNavItem,
} from "./sidebar-nav-model";

export interface SectionedNavSection {
  id: string;
  title: string;
  alwaysOpen: boolean;
  items: PresentedNavItem[];
}

interface SectionedNavProps {
  heading?: string;
  sections: SectionedNavSection[];
  settings?: PresentedNavItem | null;
  isCollapsed: boolean;
  collapsedMode: CollapsedNavMode;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}

export function SectionedNav({
  heading,
  sections,
  settings,
  isCollapsed,
  collapsedMode,
  isActive,
  onNavigate,
}: SectionedNavProps) {
  const collapsedItems = itemsWhenCollapsed(sections, collapsedMode);

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-3">
      {heading && !isCollapsed && (
        <div
          data-nav-heading="true"
          className="px-3 pb-2 text-sm font-semibold normal-case tracking-normal text-gray-900"
        >
          {heading}
        </div>
      )}

      <div
        data-nav-scroll="true"
        className={cn(
          "scrollbar-eventhub min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
          !isCollapsed && "[scrollbar-gutter:stable]",
        )}
      >
        {isCollapsed
          ? collapsedItems.map((item) => (
              <NavItemLink
                key={item.href}
                item={item}
                active={item.external ? false : isActive(item.href)}
                isCollapsed
                onNavigate={onNavigate}
              />
            ))
          : sections.map((section) => (
              <div key={section.id} data-nav-section={section.id} data-state="open">
                <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    active={item.external ? false : isActive(item.href)}
                    isCollapsed={false}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ))}
      </div>

      {settings && (
        <div className="mt-1 shrink-0 border-t pt-1" data-nav-settings="true">
          <NavItemLink
            item={settings}
            active={isActive(settings.href)}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
}

function NavItemLink({
  item,
  active,
  isCollapsed,
  onNavigate,
}: {
  item: PresentedNavItem;
  active: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const className = cn(
    "mt-1 flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventhub-primary",
    !item.external && active ? "bg-eventhub-tertiary/30 text-eventhub-primary" : "text-gray-700",
  );
  const content = (
    <>
      <Icon className="mr-2 h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={item.title}
        aria-label={isCollapsed ? item.title : undefined}
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      title={item.title}
      aria-current={active ? "page" : undefined}
      aria-label={isCollapsed ? item.title : undefined}
      className={className}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}
