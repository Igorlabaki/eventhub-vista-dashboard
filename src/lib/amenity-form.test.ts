import { describe, expect, it } from "vitest";
import { AMENITY_VIDEO_URL_MESSAGE, amenityFormData, amenityFormSchema, amenityFormSubmit } from "./amenity-form";

const YOUTUBE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function values(overrides: Record<string, unknown> = {}) {
  return amenityFormSchema.parse({ name: "Piscina", position: "", description: "", videoUrl: "", ...overrides });
}

describe("formulario da caracteristica", () => {
  it("descricao em branco vira nulo e texto perde os espacos das pontas", () => {
    expect(amenityFormSubmit(values({ description: "   " }), { removeImage: false }).description).toBeNull();
    expect(amenityFormSubmit(values({ description: "  Aquecida  " }), { removeImage: false }).description).toBe("Aquecida");
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

  it("foto e link vao juntos no mesmo envio", () => {
    const file = new File(["foto"], "piscina.png", { type: "image/png" });
    const submit = amenityFormSubmit(values({ videoUrl: YOUTUBE }), { file, removeImage: true });

    expect(submit).toMatchObject({ videoUrl: YOUTUBE, file, removeImage: false });

    const { file: sent, ...payload } = submit;
    const body = amenityFormData(payload, sent);
    expect(JSON.parse(body.get("payload") as string)).toMatchObject({ videoUrl: YOUTUBE, removeImage: false });
    expect((body.get("file") as File).name).toBe("piscina.png");
  });

  it("link apagado vai como texto vazio", () => {
    expect(amenityFormSubmit(values({ videoUrl: "  " }), { removeImage: false }).videoUrl).toBe("");
  });

  it("apagar a foto envia removeImage e mantem o link", () => {
    const submit = amenityFormSubmit(values({ videoUrl: YOUTUBE }), { removeImage: true });
    expect(submit).toMatchObject({ removeImage: true, videoUrl: YOUTUBE });
    expect(submit.file).toBeUndefined();

    const body = amenityFormData({ removeImage: submit.removeImage, videoUrl: submit.videoUrl });
    expect(body.get("file")).toBeNull();
  });
});
