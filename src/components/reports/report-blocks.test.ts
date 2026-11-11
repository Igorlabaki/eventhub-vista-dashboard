import { describe, expect, it } from "vitest";
import { OccupancyCell } from "@/types/venue";
import {
  bandLabel,
  blockErrorMessage,
  capacityIndicator,
  categoryFilterParam,
  categoryLabel,
  coverageLabel,
  formatDays,
  formatHours,
  formatRate,
  occupancyGrid,
  periodLabel,
} from "./report-blocks";

function emptyCells(): OccupancyCell[] {
  const cells: OccupancyCell[] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    for (let band = 0; band < 12; band += 1) {
      cells.push({ weekday, band, events: 0, visits: 0, blocks: 0, total: 0 });
    }
  }
  return cells;
}

describe("report-blocks", () => {
  it("formata minutos em horas", () => {
    expect(formatHours(750)).toBe("12,5 h");
    expect(formatHours(0)).toBe("0 h");
    expect(formatHours(120)).toBe("2 h");
  });

  it("reordena de segunda a domingo e calcula intensidade pelo maior valor do grupo", () => {
    const cells = emptyCells();
    cells.find((cell) => cell.weekday === 0 && cell.band === 11)!.events = 120;
    cells.find((cell) => cell.weekday === 1 && cell.band === 5)!.events = 60;
    cells.find((cell) => cell.weekday === 1 && cell.band === 5)!.visits = 30;

    const grid = occupancyGrid(cells, "events");
    expect(grid.map((row) => row.label)).toEqual(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]);
    expect(grid[0].cells).toHaveLength(12);
    expect(grid[6].cells[11]).toEqual({ band: 11, minutes: 120, intensity: 1 });
    expect(grid[0].cells[5].intensity).toBe(0.5);

    const visits = occupancyGrid(cells, "visits");
    expect(visits[0].cells[5].intensity).toBe(1);
    expect(occupancyGrid(emptyCells(), "total").every((row) => row.cells.every((cell) => cell.intensity === 0))).toBe(true);
    expect(bandLabel(0)).toBe("00–02");
    expect(bandLabel(11)).toBe("22–24");
  });

  it("taxa nula vira indisponível", () => {
    expect(formatRate(null)).toBe("indisponível");
    expect(formatRate(0.25)).toBe("25%");
    expect(formatRate(0)).toBe("0%");
    expect(formatRate(1 / 3)).toBe("33,3%");
    expect(formatDays(null)).toBe("indisponível");
    expect(formatDays(10.5)).toBe("10,5 dias");
    expect(formatDays(1)).toBe("1 dia");
  });

  it("descreve a cobertura de valor", () => {
    expect(coverageLabel(12, 15)).toBe("valor registrado em 12 de 15 linhas");
    expect(coverageLabel(0, 4)).toBe("sem valor registrado");
  });

  it("capacidade nula deixa o indicador indisponível", () => {
    expect(capacityIndicator(null)).toMatchObject({ available: false, atLeast80: "indisponível", above100: "indisponível" });
    expect(capacityIndicator({ maxGuest: 100, atLeast80: 3, above100: 1, atLeast80Rate: 0.75, above100Rate: 0.25 }))
      .toMatchObject({ available: true, atLeast80: "75%", above100: "25%" });
  });

  it("rotula o periodo e as categorias", () => {
    expect(periodLabel({ year: 2026, month: null })).toBe("Ano inteiro");
    expect(periodLabel({ year: 2026, month: 3 })).toBe("Março de 2026");
    expect(categoryLabel(null)).toBe("Sem categoria");
    expect(categoryLabel("WEDDING")).toBe("Casamento");
    expect(categoryFilterParam("ALL")).toBeUndefined();
    expect(categoryFilterParam("NONE")).toBe("NONE");
  });

  it("explica o 403 e generaliza as demais falhas", () => {
    expect(blockErrorMessage({ response: { status: 403 } })).toMatch(/permissão/);
    expect(blockErrorMessage(new Error("Network Error"))).toBe("Não foi possível carregar este bloco.");
    expect(blockErrorMessage(null)).toBe("Não foi possível carregar este bloco.");
  });
});
