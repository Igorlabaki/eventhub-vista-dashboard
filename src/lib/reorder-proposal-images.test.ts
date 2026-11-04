import { describe, expect, it } from "vitest";
import { imageOrderAfterSave, moveImageBefore, sameImageOrder } from "./reorder-proposal-images";

const images = [
  { id: "capa" },
  { id: "sala" },
  { id: "jardim" },
];

describe("ordem das fotos da proposta", () => {
  it("move a capa para o lugar da foto solta", () => {
    const next = moveImageBefore(images, "capa", "jardim");
    expect(next.map((image) => image.id)).toEqual(["sala", "jardim", "capa"]);
  });

  it("soltar no mesmo lugar nao muda a ordem", () => {
    const next = moveImageBefore(images, "sala", "sala");
    expect(sameImageOrder(next, images)).toBe(true);
  });

  it("falha ao gravar devolve a ordem anterior", () => {
    const next = moveImageBefore(images, "jardim", "capa");
    expect(imageOrderAfterSave(images, next, false)).toEqual(images);
    expect(imageOrderAfterSave(images, next, true).map((image) => image.id)).toEqual(["jardim", "capa", "sala"]);
  });
});
