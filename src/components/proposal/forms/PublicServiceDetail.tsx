import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { amenityVideoEmbedUrl } from "@/lib/amenity-video";
import { cn } from "@/lib/utils";

type PublicServiceDetailProps = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  surfaceStyle?: CSSProperties;
};

type PublicServiceDetailDialogProps = PublicServiceDetailProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images?: string[] | null;
  videoUrl?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
};

const SWIPE_MIN_DISTANCE = 50;

const navButtonClass =
  "absolute top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white before:absolute before:-inset-1 before:content-[''] hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40";

function photoClass(index: number, total: number) {
  if (total === 1) return "col-span-2 h-auto w-full rounded-md";
  if (total === 3 && index === 0) return "col-span-2 aspect-video w-full rounded-md object-cover";
  return "aspect-square w-full rounded-md object-cover";
}

export function PublicServiceDetailDialog({
  open,
  onOpenChange,
  name,
  description,
  imageUrl,
  images,
  videoUrl,
  surfaceStyle,
  onPrevious,
  onNext,
}: PublicServiceDetailDialogProps) {
  const text = description?.trim() ?? "";
  const photos = (images ?? [imageUrl ?? ""]).map((image) => image.trim()).filter(Boolean);
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
        className={cn(
          "max-w-lg gap-0 border-0 bg-transparent p-0 font-['Manrope',sans-serif] text-current shadow-none",
          navigable && "w-[calc(100%-6.5rem)]",
        )}
        style={{ color: surfaceStyle?.color }}
        onKeyDown={navigable ? handleKeyDown : undefined}
        onTouchStart={navigable ? handleTouchStart : undefined}
        onTouchEnd={navigable ? handleTouchEnd : undefined}
      >
        {navigable ? (
          <>
            <button
              type="button"
              className={cn(navButtonClass, "right-full mr-2")}
              aria-label="Anterior"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(navButtonClass, "left-full ml-2")}
              aria-label="Próximo"
              onClick={onNext}
              disabled={!onNext}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <div
          ref={contentRef}
          className="scrollbar-house grid max-h-[85vh] gap-4 overflow-y-auto border bg-background p-6 shadow-lg sm:rounded-lg"
          style={surfaceStyle}
        >
          <DialogTitle className="pr-6">{name}</DialogTitle>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <img key={`${index}-${photo}`} src={photo} alt="" className={photoClass(index, photos.length)} />
              ))}
            </div>
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
        </div>
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
