import { describe, expect, it } from "vitest";
import {
  wallClockDateIso,
  wallClockTime,
  wallClockToCalendarDate,
  wallClockDateBr,
  wallClockDateTimeBr,
  assertWallClockFormFields,
} from "./wall-clock-datetime";

const ISO = "2026-07-05T13:00:00.000Z";
const ISO_MIDNIGHT = "2026-07-05T02:00:00.000Z";

describe("wallClockTime", () => {
  it("extrai hora de string ISO", () => {
    expect(wallClockTime(ISO)).toBe("13:00");
  });

  it("extrai hora de Date", () => {
    expect(wallClockTime(new Date(ISO))).toBe("13:00");
  });

  it("lida com meia-noite wall-clock", () => {
    expect(wallClockTime(ISO_MIDNIGHT)).toBe("02:00");
  });
});

describe("wallClockDateIso", () => {
  it("extrai data de string ISO", () => {
    expect(wallClockDateIso(ISO)).toBe("2026-07-05");
  });

  it("extrai data de Date", () => {
    expect(wallClockDateIso(new Date(ISO))).toBe("2026-07-05");
  });
});

describe("wallClockToCalendarDate", () => {
  it("cria Date com componentes wall-clock locais", () => {
    const d = wallClockToCalendarDate(ISO);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(13);
    expect(d.getMinutes()).toBe(0);
  });

  it("aceita Date como entrada", () => {
    const d = wallClockToCalendarDate(new Date(ISO));
    expect(d.getHours()).toBe(13);
  });
});

describe("wallClockDateBr", () => {
  it("formata data em pt-BR wall-clock", () => {
    expect(wallClockDateBr(ISO)).toBe("05/07/2026");
  });
});

describe("wallClockDateTimeBr", () => {
  it("formata data e hora", () => {
    expect(wallClockDateTimeBr(ISO)).toBe("05/07/2026 às 13:00");
  });
});

describe("assertWallClockFormFields", () => {
  it("aceita campos válidos", () => {
    expect(() =>
      assertWallClockFormFields("2026-07-05", "13:00")
    ).not.toThrow();
  });

  it("rejeita data inválida", () => {
    expect(() => assertWallClockFormFields("05/07/2026", "13:00")).toThrow();
  });

  it("rejeita hora inválida", () => {
    expect(() => assertWallClockFormFields("2026-07-05", "1:00")).toThrow();
  });
});
