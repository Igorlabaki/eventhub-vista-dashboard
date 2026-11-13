const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIDEO_FILE = /\.(mp4|webm|ogg|mov)$/i;

export type TourVideo =
  | { kind: "file"; src: string }
  | { kind: "youtube"; embedUrl: string };

function youtubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0];
    return parts.length === 1 && id && YOUTUBE_ID.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "www.youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  if ((parts[0] === "shorts" || parts[0] === "embed") && parts.length === 2 && YOUTUBE_ID.test(parts[1])) {
    return parts[1];
  }

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v");
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  return null;
}

function httpsUrl(value: string): URL | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    return null;
  }

  return url;
}

export function youtubeVideoId(value: string): string | null {
  const url = httpsUrl(value);
  return url ? youtubeId(url) : null;
}

export function isTourVideoUrl(value: string): boolean {
  const url = httpsUrl(value);
  if (!url) {
    return false;
  }

  if (youtubeId(url)) {
    return true;
  }

  return VIDEO_FILE.test(url.pathname);
}

export function resolveTourVideo(url: string | null | undefined): TourVideo | null {
  if (!url || !isTourVideoUrl(url)) {
    return null;
  }

  const id = youtubeId(new URL(url));
  if (id) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&enablejsapi=1&cc_load_policy=0`,
    };
  }

  return { kind: "file", src: url };
}
