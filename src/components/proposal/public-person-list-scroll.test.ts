import { describe, expect, it } from "vitest";
import { personListOverflow } from "./public-person-list-scroll";

describe("personListOverflow", () => {
  it("nao marca fade quando a lista cabe inteira", () => {
    expect(personListOverflow(0, 200, 200)).toBe("none");
  });

  it("marca so a base quando ainda ha nomes abaixo", () => {
    expect(personListOverflow(0, 800, 400)).toBe("bottom");
  });

  it("marca as duas bordas no meio da lista", () => {
    expect(personListOverflow(180, 800, 400)).toBe("both");
  });

  it("marca so o topo quando a lista chegou ao fim", () => {
    expect(personListOverflow(400, 800, 400)).toBe("top");
  });
});
