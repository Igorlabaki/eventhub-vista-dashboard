import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { TourVideo } from "@/lib/tour-video";

function commandYouTube(frame: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

function hideYouTubeCaptions(frame: HTMLIFrameElement | null) {
  commandYouTube(frame, "unloadModule", ["captions"]);
  commandYouTube(frame, "unloadModule", ["cc"]);
  commandYouTube(frame, "setOption", ["captions", "track", {}]);
}

function hideFileCaptions(player: HTMLVideoElement) {
  for (let index = 0; index < player.textTracks.length; index += 1) {
    player.textTracks[index].mode = "disabled";
  }
}

export function ProposalTourVideo({ video, className }: { video: TourVideo; className?: string }) {
  const fileRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    if (video.kind !== "youtube") return;
    const timers = [400, 1200, 2500].map((delay) => window.setTimeout(() => hideYouTubeCaptions(frameRef.current), delay));
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      const raw = typeof event.data === "string" ? event.data : "";
      if (!raw.includes("onReady") && !raw.includes("caption")) return;
      hideYouTubeCaptions(frameRef.current);
    }
    window.addEventListener("message", onMessage);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("message", onMessage);
    };
  }, [video]);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    if (video.kind === "file") {
      const player = fileRef.current;
      if (!player) return;
      player.muted = !next;
      if (next) {
        player.volume = 1;
        void player.play();
      }
      return;
    }
    const frame = frameRef.current;
    if (next) {
      commandYouTube(frame, "unMute");
      commandYouTube(frame, "setVolume", [100]);
      commandYouTube(frame, "playVideo");
      return;
    }
    commandYouTube(frame, "mute");
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {video.kind === "file" ? (
        <video
          ref={fileRef}
          className="h-full w-full object-cover"
          src={video.src}
          autoPlay
          muted={!soundOn}
          loop
          playsInline
          preload="auto"
          aria-label="Tour do espaço"
          onLoadedMetadata={(event) => hideFileCaptions(event.currentTarget)}
          onPlay={(event) => hideFileCaptions(event.currentTarget)}
        />
      ) : (
        <iframe
          ref={frameRef}
          className="pointer-events-none h-full w-full"
          src={video.embedUrl}
          title="Tour do espaço"
          allow="autoplay"
          tabIndex={-1}
          onLoad={() => {
            const frame = frameRef.current;
            frame?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
            hideYouTubeCaptions(frame);
          }}
        />
      )}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Silenciar o tour" : "Ativar som do tour"}
        className="absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {soundOn ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
