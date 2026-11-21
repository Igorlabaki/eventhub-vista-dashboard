export type PersonListOverflow = "none" | "top" | "bottom" | "both";

const EDGE_PX = 6;

export function personListOverflow(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): PersonListOverflow {
  const top = scrollTop > EDGE_PX;
  const bottom = scrollHeight - clientHeight - scrollTop > EDGE_PX;
  if (top && bottom) return "both";
  if (top) return "top";
  if (bottom) return "bottom";
  return "none";
}
