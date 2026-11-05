import { useState, type CSSProperties, type MouseEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type PublicServiceDetailProps = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  surfaceStyle?: CSSProperties;
};

type PublicServiceDetailDialogProps = PublicServiceDetailProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PublicServiceDetailDialog({
  open,
  onOpenChange,
  name,
  description,
  imageUrl,
  surfaceStyle,
}: PublicServiceDetailDialogProps) {
  const text = description?.trim() ?? "";
  const photo = imageUrl?.trim() ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto font-['Manrope',sans-serif] text-current" style={surfaceStyle}>
        <DialogTitle className="pr-6">{name}</DialogTitle>
        {photo ? (
          <img src={photo} alt="" className="h-auto w-full rounded-md" />
        ) : null}
        {text ? (
          <DialogDescription className="whitespace-pre-line text-sm text-current opacity-80">
            {text}
          </DialogDescription>
        ) : (
          <DialogDescription className="sr-only">Foto do serviço.</DialogDescription>
        )}
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
