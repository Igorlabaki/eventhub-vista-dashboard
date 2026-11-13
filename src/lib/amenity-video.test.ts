import { describe, expect, it } from "vitest";
import { amenityVideoEmbedUrl, hasAmenityDetail, stepIndex } from "./amenity-video";

const EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0";

describe("video da caracteristica", () => {
  it("watch, youtu.be, Shorts e embed viram o embed sem autoplay", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "  https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30  ",
    ]) {
      expect(amenityVideoEmbedUrl(url)).toBe(EMBED);
    }
  });

  it("mp4, http, outro host e vazio nao geram player", () => {
    for (const url of [
      "https://cdn.example.com/tour.mp4",
      "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://vimeo.com/123",
      "javascript:alert(1)",
      "",
      null,
      undefined,
    ]) {
      expect(amenityVideoEmbedUrl(url)).toBeNull();
    }
  });
});

describe("botao de detalhe da caracteristica", () => {
  it("aparece com descricao, foto ou video valido", () => {
    expect(hasAmenityDetail({ description: "Aquecida", imageUrl: null, videoUrl: null })).toBe(true);
    expect(hasAmenityDetail({ description: null, imageUrl: "https://foto", videoUrl: null })).toBe(true);
    expect(hasAmenityDetail({ description: null, imageUrl: null, videoUrl: "https://youtu.be/dQw4w9WgXcQ" })).toBe(true);
  });

  it("nao aparece sem complemento, com descricao em branco ou so com video invalido", () => {
    expect(hasAmenityDetail({ description: null, imageUrl: null, videoUrl: null })).toBe(false);
    expect(hasAmenityDetail({ description: "   ", imageUrl: null, videoUrl: null })).toBe(false);
    expect(hasAmenityDetail({ description: null, imageUrl: null, videoUrl: "https://cdn.example.com/tour.mp4" })).toBe(false);
  });
});

describe("navegacao entre caracteristicas no modal", () => {
  it("avanca e volta em circulo", () => {
    expect(stepIndex(0, 1, 3)).toBe(1);
    expect(stepIndex(2, 1, 3)).toBe(0);
    expect(stepIndex(0, -1, 3)).toBe(2);
    expect(stepIndex(1, -1, 3)).toBe(0);
  });

  it("sem item aberto ou lista vazia, nao muda", () => {
    expect(stepIndex(null, 1, 3)).toBeNull();
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});
