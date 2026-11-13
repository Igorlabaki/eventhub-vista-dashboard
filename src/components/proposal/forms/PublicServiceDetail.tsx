import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { amenityVideoEmbedUrl } from "@/lib/amenity-video";

type PublicServiceDetailProps = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  surfaceStyle?: CSSProperties;
};

type PublicServiceDetailDialogProps = PublicServiceDetailProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  position?: { current: number; total: number };
};

const SWIPE_MIN_DISTANCE = 50;

const navButtonClass =
  "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/30 before:absolute before:-inset-1 before:content-[''] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40";

export function PublicServiceDetailDialog({
  open,
  onOpenChange,
  name,
  description,
  imageUrl,
  videoUrl,
  surfaceStyle,
  onPrevious,
  onNext,
  position,
}: PublicServiceDetailDialogProps) {
  const text = description?.trim() ?? "";
  const photo = imageUrl?.trim() ?? "";
  const embedUrl = amenityVideoEmbedUrl(videoUrl);
  const navigable = Boolean(onPrevious || onNext);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [name]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" && onPrevious) {
      event.preventDefault();
      onPrevious();
    } else if (event.key === "ArrowRight" && onNext) {
      event.preventDefault();
      onNext();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) onNext?.();
    else onPrevious?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="scrollbar-house max-h-[85vh] overflow-y-auto font-['Manrope',sans-serif] text-current"
        style={surfaceStyle}
        onKeyDown={navigable ? handleKeyDown : undefined}
        onTouchStart={navigable ? handleTouchStart : undefined}
        onTouchEnd={navigable ? handleTouchEnd : undefined}
      >
        <DialogTitle className="pr-6">{name}</DialogTitle>
        {navigable ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={navButtonClass}
              aria-label="Anterior"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {position ? (
              <span className="text-sm opacity-70" aria-live="polite">
                {position.current} de {position.total}
              </span>
            ) : null}
            <button
              type="button"
              className={navButtonClass}
              aria-label="Próximo"
              onClick={onNext}
              disabled={!onNext}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        {photo ? (
          <img key={photo} src={photo} alt="" className="h-auto w-full rounded-md" />
        ) : null}
        {text ? (
          <DialogDescription className="whitespace-pre-line text-sm text-current opacity-80">
            {text}
          </DialogDescription>
        ) : (
          <DialogDescription className="sr-only">Detalhes de {name}.</DialogDescription>
        )}
        {embedUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <iframe
              key={`${name}-${embedUrl}`}
              src={embedUrl}
              title={`Vídeo de ${name}`}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function keepClickOnTheButton(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function PublicServiceDetail({
  name,
  description,
  imageUrl,
  surfaceStyle,
}: PublicServiceDetailProps) {
  const text = description?.trim() ?? "";
  const photo = imageUrl?.trim() ?? "";
  const [open, setOpen] = useState(false);
  if (!text && !photo) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`Ver detalhes de ${name}`}
        className="ml-1 inline-flex h-4 w-4 shrink-0 translate-y-px items-center justify-center rounded-full border border-current text-[10px] leading-none"
        onMouseDown={keepClickOnTheButton}
        onClick={(event) => {
          keepClickOnTheButton(event);
          setOpen(true);
        }}
      >
        ?
      </button>
      <PublicServiceDetailDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        description={text}
        imageUrl={photo}
        surfaceStyle={surfaceStyle}
      />
    </>
  );
}
