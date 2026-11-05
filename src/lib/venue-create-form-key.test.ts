import { describe, expect, it } from "vitest";
import { venueCreateFormKey } from "@/lib/venue-create-form-key";

describe("venueCreateFormKey", () => {
  it("muda a key da criacao quando a sessao incrementa", () => {
    expect(venueCreateFormKey(undefined, 1)).toBe("new-1");
    expect(venueCreateFormKey(undefined, 2)).toBe("new-2");
    expect(venueCreateFormKey("", 3)).toBe("new-3");
  });

  it("usa o id na edicao, independente da sessao", () => {
    expect(venueCreateFormKey("rule-1", 4)).toBe("rule-1");
    expect(venueCreateFormKey("rule-1", 9)).toBe("rule-1");
  });
});
