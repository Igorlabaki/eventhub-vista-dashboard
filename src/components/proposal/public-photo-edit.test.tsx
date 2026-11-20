import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PhotoChoiceButton, PhotoGrip, PHOTO_CHOICE_ERROR, commitPhotoChoice, publicPhotoFlags } from "./public-photo-edit";

const previous = [{ id: "a", imageUrl: "https://a", description: null, position: 1 }];
const replacement = { id: "b", imageUrl: "https://b", description: null, position: 2, isShowOnProposal: false };

function chrome(canReorder: boolean, visibleCount: number, catalogCount: number) {
  const flags = publicPhotoFlags(canReorder, visibleCount, catalogCount);
  return renderToStaticMarkup(
    <div>
      {flags.grip && <PhotoGrip />}
      {flags.choose && <PhotoChoiceButton disabled={false} onChoose={() => undefined} />}
    </div>,
  );
}

describe("controles da galeria publica", () => {
  it("com duas fotos visiveis e catalogo mostra alca e Trocar foto", () => {
    const html = chrome(true, 2, 2);
    expect(html).toContain("Arrastar foto");
    expect(html).toContain("Trocar foto");
  });

  it("uma foto visivel e catalogo maior mostra so a troca", () => {
    const html = chrome(true, 1, 3);
    expect(html).not.toContain("Arrastar foto");
    expect(html).toContain("Trocar foto");
  });

  it("sem permissao ou catalogo de uma foto nao mostra controles", () => {
    expect(chrome(false, 4, 4)).not.toContain("Trocar foto");
    expect(chrome(false, 4, 4)).not.toContain("Arrastar foto");
    expect(chrome(true, 3, 1)).not.toContain("Trocar foto");
    expect(chrome(true, 3, 0)).not.toContain("Trocar foto");
  });

  it("a troca grava a foto nova e a falha devolve a anterior com a mensagem", async () => {
    const saved = await commitPhotoChoice(previous, async () => ({
      images: [replacement],
      catalog: [replacement],
    }));
    expect(saved.images).toEqual([replacement]);
    expect(saved.error).toBeNull();

    const failed = await commitPhotoChoice(previous, async () => {
      throw new Error("down");
    });
    expect(failed.images).toEqual(previous);
    expect(failed.error).toBe(PHOTO_CHOICE_ERROR);
  });
});
