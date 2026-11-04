export interface ChoosableImage {
  id: string;
}

export function replaceProposalImage<T extends ChoosableImage>(images: T[], slotId: string, replacement: T): T[] {
  if (replacement.id === slotId) {
    return images;
  }
  const slotIndex = images.findIndex((image) => image.id === slotId);
  if (slotIndex < 0) {
    return images;
  }
  const next = images.slice();
  const replacementIndex = next.findIndex((image) => image.id === replacement.id);
  if (replacementIndex >= 0) {
    const slot = next[slotIndex];
    next[slotIndex] = next[replacementIndex];
    next[replacementIndex] = slot;
    return next;
  }
  next[slotIndex] = replacement;
  return next;
}
