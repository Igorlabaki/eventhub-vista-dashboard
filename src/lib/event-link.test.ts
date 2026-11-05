import { describe, expect, it } from "vitest";
import { wallClockToCalendarDate } from "@/lib/wall-clock-datetime";
import { eventCountdown, eventLinkDestinations, eventLinkSummary, proposalEventLinksUrl } from "@/lib/event-link";

const START = "2026-07-05T13:00:00.000Z";
const END = "2026-07-05T18:00:00.000Z";
const END_NEXT_DAY = "2026-07-06T02:00:00.000Z";

function beforeStart(ms: number) {
  return new Date(wallClockToCalendarDate(START).getTime() - ms);
}

describe("eventLinkSummary", () => {
  it("mostra dia, horario e convidados no relogio de parede", () => {
    expect(eventLinkSummary({ startDate: START, endDate: END, guestNumber: 80 })).toEqual({
      dayLabel: "05/07/2026",
      timeLabel: "13h às 18h",
      guestLabel: "80 pessoas",
    });
  });

  it("mostra o intervalo quando o fim cai em outro dia", () => {
    expect(eventLinkSummary({ startDate: START, endDate: END_NEXT_DAY, guestNumber: 1 }).dayLabel).toBe(
      "05/07/2026 até 06/07/2026"
    );
  });

  it("omite dia, hora e convidados quando faltam", () => {
    expect(eventLinkSummary({ guestNumber: null })).toEqual({
      dayLabel: null,
      timeLabel: null,
      guestLabel: null,
    });
    expect(eventLinkSummary({ startDate: START, guestNumber: "abc" }).guestLabel).toBeNull();
  });

  it("trata uma pessoa no singular e conserva os minutos", () => {
    expect(eventLinkSummary({ startDate: START, guestNumber: "1" }).guestLabel).toBe("1 pessoa");
    expect(eventLinkSummary({ startDate: "2026-07-05T13:30:00.000Z", endDate: "2026-07-05T18:15:00.000Z" }).timeLabel).toBe(
      "13h30 às 18h15"
    );
  });
});

describe("eventCountdown", () => {
  it("conta ate o inicio pelos digitos de parede", () => {
    const now = beforeStart((2 * 24 * 60 + 3 * 60 + 4) * 60_000);
    expect(eventCountdown(START, END, now)).toEqual({
      kind: "countdown",
      phrase: "Seu evento está chegando",
      parts: { days: "02", hours: "03", minutes: "04" },
    });
    const offset = wallClockToCalendarDate(START).getTime() - new Date(START).getTime();
    if (offset !== 0) {
      const utcNow = new Date(new Date(START).getTime() - (2 * 24 * 60 + 3 * 60 + 4) * 60_000);
      const shifted = eventCountdown(START, END, utcNow);
      const stamp = shifted.kind === "countdown" ? `${shifted.parts.days}${shifted.parts.hours}${shifted.parts.minutes}` : shifted.kind;
      expect(stamp).not.toBe("020304");
    }
  });

  it("mostra um dia e menos de um minuto em dois digitos", () => {
    expect(eventCountdown(START, END, beforeStart(24 * 60 * 60_000))).toEqual({
      kind: "countdown",
      phrase: "Seu evento está chegando",
      parts: { days: "01", hours: "00", minutes: "00" },
    });
    expect(eventCountdown(START, END, beforeStart(30_000))).toEqual({
      kind: "countdown",
      phrase: "Seu evento está chegando",
      parts: { days: "00", hours: "00", minutes: "00" },
    });
  });

  it("troca a frase depois do inicio e depois do fim", () => {
    const start = wallClockToCalendarDate(START);
    const end = wallClockToCalendarDate(END);
    expect(eventCountdown(START, END, start).kind).toBe("started");
    expect(eventCountdown(START, END, new Date(end.getTime() - 60_000)).phrase).toBe("O evento já começou.");
    expect(eventCountdown(START, END, end).phrase).toBe("O evento já aconteceu.");
  });

  it("omite a contagem quando nao ha data", () => {
    expect(eventCountdown(null, END, new Date()).kind).toBe("hidden");
  });

  it("mantem o evento em andamento quando nao ha fim", () => {
    expect(eventCountdown(START, null, wallClockToCalendarDate(END)).phrase).toBe("O evento já começou.");
  });
});

describe("proposalEventLinksUrl", () => {
  it("abre a pagina publica na base de producao", () => {
    expect(proposalEventLinksUrl).toHaveLength(1);
    expect(proposalEventLinksUrl("proposal-1")).toBe(
      "https://event-hub-dashboard.vercel.app/proposal/proposal-1/links",
    );
    expect(proposalEventLinksUrl("proposal-1")).not.toContain("localhost");
  });
});

describe("eventLinkDestinations", () => {
  it("aponta so para as cinco paginas publicas do orcamento", () => {
    const hrefs = eventLinkDestinations("abc").map((item) => item.href);
    expect(hrefs).toEqual([
      "/proposal/abc/view",
      "/proposal/abc/indications",
      "/proposal/abc/guest-list",
      "/proposal/abc/staff-list",
      "/proposal/abc/schedule-list",
    ]);
    expect(hrefs.join(" ")).not.toMatch(/payment|contract|documents|edit|attendance|rules/);
  });

  it("acrescenta as regras do espaco quando o orcamento tem venue", () => {
    const hrefs = eventLinkDestinations("abc", "venue-1").map((item) => item.href);
    expect(eventLinkDestinations("abc", "venue-1").map((item) => item.label)).toContain("Regras do espaço");
    expect(hrefs).toEqual([
      "/proposal/abc/view",
      "/proposal/abc/indications",
      "/proposal/abc/guest-list",
      "/proposal/abc/staff-list",
      "/proposal/abc/schedule-list",
      "/venue/venue-1/rules/view",
    ]);
    expect(hrefs.join(" ")).not.toMatch(/payment|contract|documents|edit|attendance/);
  });
});
