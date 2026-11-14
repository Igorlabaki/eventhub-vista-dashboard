import { describe, expect, it } from "vitest";
import {
  AMENITY_VIDEO_URL_MESSAGE,
  AmenityPhoto,
  addPhotos,
  amenityFormData,
  amenityFormSchema,
  amenityFormSubmit,
  amenityPhotoPayload,
  initialPhotos,
  movePhoto,
  photoKey,
  removePhoto,
  revokePhotoPreviews,
} from "./amenity-form";

const YOUTUBE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function values(overrides: Record<string, unknown> = {}) {
  return amenityFormSchema.parse({ name: "Piscina", position: "", description: "", videoUrl: "", ...overrides });
}

function file(name: string) {
  return new File(["foto"], name, { type: "image/png" });
}

const preview = (chosen: File) => `blob:${chosen.name}`;

function saved(id: string): AmenityPhoto {
  return { kind: "existing", id, url: `https://bucket/${id}.webp` };
}

function ids(list: AmenityPhoto[]) {
  return list.map((photo) => (photo.kind === "existing" ? photo.id : photo.file.name));
}

describe("formulario da caracteristica", () => {
  it("descricao em branco vira nulo e texto perde os espacos das pontas", () => {
    expect(amenityFormSubmit(values({ description: "   " }), []).description).toBeNull();
    expect(amenityFormSubmit(values({ description: "  Aquecida  " }), []).description).toBe("Aquecida");
  });

  it("recusa descricao acima de 500 caracteres", () => {
    expect(amenityFormSchema.safeParse({ name: "Piscina", description: "a".repeat(501), videoUrl: "" }).success).toBe(false);
  });

  it("recusa link que nao e do YouTube", () => {
    for (const videoUrl of ["https://cdn.example.com/tour.mp4", "http://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://vimeo.com/1"]) {
      const result = amenityFormSchema.safeParse({ name: "Piscina", description: "", videoUrl });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe(AMENITY_VIDEO_URL_MESSAGE);
    }
    expect(amenityFormSchema.safeParse({ name: "Piscina", description: "", videoUrl: "https://youtu.be/dQw4w9WgXcQ" }).success).toBe(true);
  });

  it("link apagado vai como texto vazio", () => {
    expect(amenityFormSubmit(values({ videoUrl: "  " }), []).videoUrl).toBe("");
  });

  it("fotos salvas entram na ordem de position", () => {
    const photos = initialPhotos({
      images: [
        { id: "b", imageUrl: "https://bucket/b.webp", position: 1 },
        { id: "a", imageUrl: "https://bucket/a.webp", position: 0 },
      ],
    });
    expect(ids(photos)).toEqual(["a", "b"]);
    expect(initialPhotos(null)).toEqual([]);
  });

  it("com uma foto na lista e quatro arquivos aceita dois e devolve dois descartados", () => {
    const { list, skipped } = addPhotos([saved("a")], [file("1.png"), file("2.png"), file("3.png"), file("4.png")], preview);
    expect(ids(list)).toEqual(["a", "1.png", "2.png"]);
    expect(skipped.map((item) => item.name)).toEqual(["3.png", "4.png"]);
    expect(list[1]).toMatchObject({ kind: "new", previewUrl: "blob:1.png" });
    expect(photoKey(list[1])).not.toBe(photoKey(list[2]));

    const full = addPhotos(list, [file("5.png")], preview);
    expect(full.list).toHaveLength(3);
    expect(full.skipped).toHaveLength(1);
  });

  it("mover nas pontas nao muda e no meio troca de lugar", () => {
    const list = [saved("a"), saved("b"), saved("c")];
    expect(movePhoto(list, 0, -1)).toBe(list);
    expect(movePhoto(list, 2, 1)).toBe(list);
    expect(ids(movePhoto(list, 1, -1))).toEqual(["b", "a", "c"]);
    expect(ids(movePhoto(list, 1, 1))).toEqual(["a", "c", "b"]);
  });

  it("remove foto salva e foto nova e revoga so a pre-visualizacao da nova", () => {
    const { list } = addPhotos([saved("a")], [file("1.png")], preview);
    expect(ids(removePhoto(list, 0))).toEqual(["1.png"]);
    expect(ids(removePhoto(list, 1))).toEqual(["a"]);

    const revoked: string[] = [];
    revokePhotoPreviews(list, (url) => revoked.push(url));
    expect(revoked).toEqual(["blob:1.png"]);
  });

  it("salva, nova e salva viram id, newIndex 0 e id com um arquivo", () => {
    const novo = file("nova.png");
    const list: AmenityPhoto[] = [saved("a"), { kind: "new", key: "k", file: novo, previewUrl: "blob:x" }, saved("c")];

    const { images, files } = amenityPhotoPayload(list);

    expect(images).toEqual([{ id: "a" }, { newIndex: 0 }, { id: "c" }]);
    expect(files).toEqual([novo]);
  });

  it("os arquivos vao no FormData na ordem dos newIndex", () => {
    const { list } = addPhotos([], [file("1.png"), file("2.png")], preview);
    const { images, files } = amenityPhotoPayload(movePhoto(list, 0, 1));
    expect(images).toEqual([{ newIndex: 0 }, { newIndex: 1 }]);

    const body = amenityFormData({ name: "Piscina", videoUrl: YOUTUBE, images }, files);
    expect(JSON.parse(body.get("payload") as string)).toMatchObject({ videoUrl: YOUTUBE, images });
    expect((body.getAll("files") as File[]).map((item) => item.name)).toEqual(["2.png", "1.png"]);
  });

  it("sem fotos a lista vai vazia e nenhum arquivo vai no envio", () => {
    const { images, files } = amenityPhotoPayload([]);
    expect(images).toEqual([]);
    const body = amenityFormData({ images }, files);
    expect(JSON.parse(body.get("payload") as string)).toEqual({ images: [] });
    expect(body.getAll("files")).toEqual([]);
  });
});
