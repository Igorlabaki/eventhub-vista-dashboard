import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { replaceProposalImage } from "@/lib/choose-proposal-image";
import { imageOrderAfterSave, moveImageBefore, sameImageOrder } from "@/lib/reorder-proposal-images";

export const PHOTO_CHOICE_ERROR = "Não foi possível trocar a foto. A foto anterior voltou.";

export type PublicCatalogImage = {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
  isShowOnProposal: boolean;
};

export type PublicVisibleImage = {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
};

export async function commitPhotoChoice<T>(
  previous: T[],
  request: () => Promise<{ images: T[]; catalog: PublicCatalogImage[] }>,
): Promise<{ images: T[]; catalog: PublicCatalogImage[] | null; error: string | null }> {
  try {
    const saved = await request();
    return { images: saved.images, catalog: saved.catalog, error: null };
  } catch {
    return { images: previous, catalog: null, error: PHOTO_CHOICE_ERROR };
  }
}

export function publicPhotoFlags(canReorder: boolean, visibleCount: number, catalogCount: number) {
  return {
    grip: canReorder && visibleCount > 1,
    choose: canReorder && catalogCount > 1,
  };
}

export function PhotoGrip() {
  return (
    <span
      aria-label="Arrastar foto"
      className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
    >
      <GripVertical className="h-4 w-4" />
    </span>
  );
}

export function PhotoChoiceButton({ disabled, onChoose }: { disabled: boolean; onChoose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Trocar foto"
      disabled={disabled}
      draggable={false}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChoose();
      }}
      className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Trocar foto
    </button>
  );
}

export function PhotoChoiceDialog({
  open,
  saving,
  error,
  catalog,
  visibleIds,
  selectedId,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  saving: boolean;
  error: string | null;
  catalog: PublicCatalogImage[];
  visibleIds: string[];
  selectedId: string | null;
  onOpenChange: (open: boolean) => void;
  onPick: (image: PublicCatalogImage) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>Escolher foto</DialogTitle>
        <DialogDescription>Escolha uma foto deste espaço para este lugar.</DialogDescription>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {catalog.map((image) => {
            const selected = image.id === selectedId;
            const onLink = visibleIds.includes(image.id);
            return (
              <button
                key={image.id}
                type="button"
                disabled={saving}
                aria-pressed={selected}
                onClick={() => onPick(image)}
                className={`relative overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${selected ? "ring-2 ring-black" : ""}`}
              >
                <img src={image.imageUrl} alt={image.description || "Foto do espaço"} className="h-28 w-full object-cover" />
                {onLink && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    No link
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function usePublicPhotoEdit<T extends PublicVisibleImage>({
  images,
  catalog,
  canReorder,
  onReorder,
  onChoose,
}: {
  images: T[];
  catalog: PublicCatalogImage[];
  canReorder: boolean;
  onReorder: (ids: string[]) => Promise<void>;
  onChoose: (slotId: string, replacementId: string) => Promise<{ images: T[]; catalog: PublicCatalogImage[] }>;
}) {
  const [orderedImages, setOrderedImages] = useState(images);
  const [currentCatalog, setCurrentCatalog] = useState(catalog);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingChoice, setSavingChoice] = useState(false);
  const [choiceSlotId, setChoiceSlotId] = useState<string | null>(null);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragMoved = useRef(false);
  const imageKey = images.map((image) => image.id).join("|");
  const catalogKey = catalog.map((image) => `${image.id}:${image.isShowOnProposal}`).join("|");

  useEffect(() => {
    setOrderedImages(images);
    setCurrentCatalog(catalog);
  }, [imageKey, catalogKey]);

  const flags = publicPhotoFlags(canReorder, orderedImages.length, currentCatalog.length);
  const locked = savingOrder || savingChoice;
  const dragEnabled = flags.grip && !locked;

  async function persistOrder(fromId: string, toId: string) {
    if (!dragEnabled) return;
    const next = moveImageBefore(orderedImages, fromId, toId);
    if (sameImageOrder(next, orderedImages)) return;
    setOrderedImages(next);
    setSavingOrder(true);
    try {
      await onReorder(next.map((image) => image.id));
      setOrderedImages(imageOrderAfterSave(orderedImages, next, true));
    } catch {
      setOrderedImages(imageOrderAfterSave(orderedImages, next, false));
    } finally {
      setSavingOrder(false);
      setDraggedId(null);
    }
  }

  async function persistChoice(replacement: PublicCatalogImage) {
    if (!choiceSlotId || !flags.choose || locked) return;
    if (replacement.id === choiceSlotId) {
      setChoiceSlotId(null);
      setChoiceError(null);
      return;
    }
    const previous = orderedImages;
    const next = replaceProposalImage(orderedImages, choiceSlotId, replacement);
    setOrderedImages(next);
    setSavingChoice(true);
    setChoiceError(null);
    const saved = await commitPhotoChoice(previous, () => onChoose(choiceSlotId, replacement.id));
    setOrderedImages(saved.images);
    if (saved.catalog) setCurrentCatalog(saved.catalog);
    setChoiceError(saved.error);
    if (!saved.error) setChoiceSlotId(null);
    setSavingChoice(false);
  }

  function dragProps(imageId: string) {
    if (!dragEnabled) return {};
    return {
      draggable: true as const,
      onDragStart: (event: React.DragEvent) => {
        dragMoved.current = true;
        event.dataTransfer.setData("text/plain", imageId);
        event.dataTransfer.effectAllowed = "move";
        setDraggedId(imageId);
      },
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        const fromId = event.dataTransfer.getData("text/plain") || draggedId;
        if (fromId) void persistOrder(fromId, imageId);
      },
      onDragEnd: () => {
        setDraggedId(null);
        window.setTimeout(() => {
          dragMoved.current = false;
        }, 0);
      },
    };
  }

  const dialog = (
    <PhotoChoiceDialog
      open={choiceSlotId !== null}
      saving={locked}
      error={choiceError}
      catalog={currentCatalog}
      visibleIds={orderedImages.map((image) => image.id)}
      selectedId={choiceSlotId}
      onOpenChange={(open) => {
        if (!open && !savingChoice) {
          setChoiceSlotId(null);
          setChoiceError(null);
        }
      }}
      onPick={(image) => {
        void persistChoice(image);
      }}
    />
  );

  return {
    orderedImages,
    showGrip: flags.grip,
    showChoice: flags.choose,
    disabled: locked,
    draggedId,
    dragEnabled,
    dragProps,
    openChoice: setChoiceSlotId,
    ignoreClick: () => {
      if (!dragMoved.current) return false;
      dragMoved.current = false;
      return true;
    },
    dialog,
  };
}
