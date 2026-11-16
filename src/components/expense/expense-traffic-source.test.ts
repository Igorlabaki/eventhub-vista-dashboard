import { describe, expect, it } from "vitest";
import { ExpenseCategory } from "@/types/expense";
import {
  expenseChannelLabel,
  expenseTrafficSourceOptions,
  expenseTrafficSourcePayload,
} from "./expense-traffic-source";

describe("canal da despesa", () => {
  it("oferece os cinco canais na ordem", () => {
    expect(expenseTrafficSourceOptions.map((option) => option.display)).toEqual([
      "Instagram",
      "Facebook",
      "TikTok",
      "Google",
      "Outros",
    ]);
  });

  it("Publicidade envia o canal escolhido", () => {
    expect(expenseTrafficSourcePayload(ExpenseCategory.ADVERTISING, "TIKTOK")).toBe("TIKTOK");
    expect(expenseTrafficSourcePayload(ExpenseCategory.ADVERTISING, "")).toBeNull();
  });

  it("outra categoria envia null mesmo com canal no formulario", () => {
    expect(expenseTrafficSourcePayload(ExpenseCategory.MAINTENANCE, "GOOGLE")).toBeNull();
  });

  it("lista mostra o canal so em Publicidade", () => {
    expect(expenseChannelLabel({ category: ExpenseCategory.ADVERTISING, trafficSource: "INSTAGRAM" })).toBe("Instagram");
    expect(expenseChannelLabel({ category: ExpenseCategory.ADVERTISING, trafficSource: null })).toBeNull();
    expect(expenseChannelLabel({ category: ExpenseCategory.TAX, trafficSource: "GOOGLE" })).toBeNull();
  });
});
