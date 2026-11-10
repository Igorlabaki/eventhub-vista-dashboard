import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublicServiceDetailDialog } from "./PublicServiceDetail";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: ComponentProps<"div">) => <>{children}</>,
  DialogContent: (props: ComponentProps<"div">) => <div data-testid="content" {...props} />,
  DialogTitle: (props: ComponentProps<"h2">) => <h2 {...props} />,
  DialogDescription: (props: ComponentProps<"p">) => <p {...props} />,
}));

describe("PublicServiceDetailDialog", () => {
  it("rola com a barra nas cores da casa", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Painel de Led"
        imageUrl="https://example.com/led.jpg"
        surfaceStyle={{ backgroundColor: "#181818", color: "#f5f5f5" }}
      />,
    );

    expect(html).toContain("scrollbar-house");
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("color:#f5f5f5");
  });
});
