import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

/**
 * Handles redirect from backend after Google Calendar OAuth callback.
 * When URL has google_calendar=connected or google_calendar=error, shows toast and clears params.
 */
export function GoogleCalendarRedirectHandler() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("google_calendar");
    if (status === "connected") {
      toast({
        title: "Google Calendar conectado",
        description:
          "Seus eventos serão sincronizados com o Google Calendar.",
      });
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("google_calendar");
        next.delete("organizationId");
        return next;
      }, { replace: true });
    }
    if (status === "error") {
      const msg =
        searchParams.get("message") ?? "Erro ao conectar Google Calendar.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("google_calendar");
        next.delete("message");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return null;
}
