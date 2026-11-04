import { describe, expect, it } from "vitest";
import { resolveTourVideo } from "./tour-video";

const id = "dQw4w9WgXcQ";
const embed = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&enablejsapi=1&cc_load_policy=0`;

describe("resolveTourVideo", () => {
  it("arquivo vira video nativo", () => {
    expect(resolveTourVideo("https://cdn.example.com/tour.mp4?token=1")).toEqual({
      kind: "file",
      src: "https://cdn.example.com/tour.mp4?token=1",
    });
  });

  it.each([
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://m.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
  ])("youtube %s vira embed sem controles", (url) => {
    expect(resolveTourVideo(url)).toEqual({ kind: "youtube", embedUrl: embed });
  });

  it.each([null, undefined, "", "https://exemplo.com/pagina", "http://cdn.example.com/tour.mp4"])(
    "nao renderiza %s",
    (url) => {
      expect(resolveTourVideo(url)).toBeNull();
    }
  );
});
