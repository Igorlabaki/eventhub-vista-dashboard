const VISITOR_COOKIE = "eh_vid";
const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME_ZONE = "America/Sao_Paulo";

export type PublicSurfaceName = "LINKS" | "FORM";

export type PublicSurfaceTransport = {
    apiBase: string;
    now: Date;
    secure: boolean;
    randomId: string;
    sent: Set<string>;
    readCookie: () => string;
    writeCookie: (value: string) => void;
    send: (url: string, body: string) => void;
};

function calendarParts(at: Date) {
    const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(at);
    const pick = (type: string) => Number(formatted.find((part) => part.type === type)?.value);
    return { year: pick("year"), month: pick("month"), day: pick("day"), hour: pick("hour") % 24, minute: pick("minute"), second: pick("second") };
}

function zoneOffsetMs(at: Date) {
    const parts = calendarParts(at);
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - at.getTime();
}

export function saoPauloMonthKey(at: Date) {
    const parts = calendarParts(at);
    return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

export function saoPauloMonthStart(year: number, month: number) {
    const guess = new Date(Date.UTC(year, month - 1, 1));
    const offset = zoneOffsetMs(guess);
    const instant = new Date(guess.getTime() - offset);
    const correction = zoneOffsetMs(instant) - offset;
    return correction === 0 ? instant : new Date(instant.getTime() - correction);
}

export function visitorCookie(id: string, at: Date, secure: boolean) {
    const parts = calendarParts(at);
    const year = parts.month === 12 ? parts.year + 1 : parts.year;
    const month = parts.month === 12 ? 1 : parts.month + 1;
    const expires = saoPauloMonthStart(year, month).toUTCString();
    return `${VISITOR_COOKIE}=${id}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}; Expires=${expires}`;
}

export function readVisitorId(jar: string) {
    const found = jar.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${VISITOR_COOKIE}=`));
    if (!found) return null;
    const value = decodeURIComponent(found.slice(VISITOR_COOKIE.length + 1));
    return VISITOR_ID.test(value) ? value.toLowerCase() : null;
}

export function rememberVisitor(transport: Pick<PublicSurfaceTransport, "readCookie" | "writeCookie" | "now" | "secure" | "randomId">) {
    const current = readVisitorId(transport.readCookie());
    if (current) return current;
    transport.writeCookie(visitorCookie(transport.randomId, transport.now, transport.secure));
    return readVisitorId(transport.readCookie());
}

export function countedCardHref(apiBase: string, venueKey: string, kind: string) {
    const base = apiBase.replace(/\/$/, "");
    return `${base}/venue/links/${encodeURIComponent(venueKey)}/go/${encodeURIComponent(kind)}`;
}

export function dispatchPublicSurfaceBeacon(
    surface: PublicSurfaceName,
    venueKey: string,
    transport: PublicSurfaceTransport,
) {
    const claim = `${surface}:${venueKey}`;
    if (transport.sent.has(claim)) return { sent: false, body: "" };
    transport.sent.add(claim);
    const visitorId = surface === "LINKS" ? rememberVisitor(transport) : null;
    const body = JSON.stringify(visitorId ? { surface, visitorKey: visitorId } : { surface });
    const url = `${transport.apiBase.replace(/\/$/, "")}/venue/links/${encodeURIComponent(venueKey)}/view`;
    transport.send(url, body);
    return { sent: true, body };
}

export function browserPublicSurfaceTransport(sent: Set<string>): PublicSurfaceTransport {
    return {
        apiBase: String(import.meta.env.VITE_API_URL || "").replace(/\/$/, ""),
        now: new Date(),
        secure: typeof window !== "undefined" && window.location.protocol === "https:",
        randomId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "00000000-0000-4000-8000-000000000000",
        sent,
        readCookie: () => (typeof document === "undefined" ? "" : document.cookie),
        writeCookie: (value) => {
            if (typeof document !== "undefined") document.cookie = value;
        },
        send: (url, body) => {
            if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
                navigator.sendBeacon(url, body);
            }
        },
    };
}
