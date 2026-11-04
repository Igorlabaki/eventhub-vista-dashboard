import { describe, expect, it } from "vitest";
import { imageOrderAfterSave } from "./reorder-proposal-images";
import { replaceProposalImage } from "./choose-proposal-image";

const images = [
  { id: "capa", imageUrl: "https://capa" },
  { id: "sala", imageUrl: "https://sala" },
];

describe("troca da foto da proposta", () => {
  it("coloca uma foto de fora no lugar da escolhida", () => {
    const next = replaceProposalImage(images, "capa", { id: "oculta", imageUrl: "https://oculta" });
    expect(next.map((image) => image.id)).toEqual(["oculta", "sala"]);
  });

  it("troca de lugar duas fotos que ja estao no link", () => {
    const next = replaceProposalImage(images, "capa", images[1]);
    expect(next.map((image) => image.id)).toEqual(["sala", "capa"]);
  });

  it("escolher a mesma foto nao muda a lista", () => {
    const next = replaceProposalImage(images, "capa", images[0]);
    expect(next).toBe(images);
  });

  it("falha ao gravar devolve a foto anterior", () => {
    const next = replaceProposalImage(images, "sala", { id: "oculta", imageUrl: "https://oculta" });
    expect(imageOrderAfterSave(images, next, false)).toEqual(images);
    expect(imageOrderAfterSave(images, next, true).map((image) => image.id)).toEqual(["capa", "oculta"]);
  });
});
