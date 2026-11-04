export interface OrderedImage {
  id: string;
}

export function moveImageBefore<T extends OrderedImage>(images: T[], fromId: string, toId: string): T[] {
  if (fromId === toId) {
    return images;
  }
  const from = images.findIndex((image) => image.id === fromId);
  const to = images.findIndex((image) => image.id === toId);
  if (from < 0 || to < 0) {
    return images;
  }
  const next = images.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function sameImageOrder(left: OrderedImage[], right: OrderedImage[]) {
  return left.length === right.length && left.every((image, index) => image.id === right[index]?.id);
}

export function imageOrderAfterSave<T>(previous: T[], next: T[], saved: boolean): T[] {
  return saved ? next : previous;
}
