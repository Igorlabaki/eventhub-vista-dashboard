import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type SelectionBox = { x: number; y: number; width: number; height: number };

const indicatorMotion =
  "pointer-events-none absolute left-0 top-0 transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none";

export function useSlidingSelection(activeKey: string, selector: string) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<SelectionBox | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(selector);
    if (!active) {
      setBox(null);
      return;
    }
    setBox({
      x: active.offsetLeft,
      y: active.offsetTop,
      width: active.offsetWidth,
      height: active.offsetHeight,
    });
  }, [selector]);

  useIsoLayoutEffect(() => {
    measure();
  }, [measure, activeKey]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  return { rootRef, box };
}

export function PillIndicator({ box }: { box: SelectionBox | null }) {
  if (!box) return null;
  return (
    <span
      aria-hidden
      className={`${indicatorMotion} rounded-full bg-violet-600`}
      style={{
        width: box.width,
        height: box.height,
        transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
      }}
    />
  );
}

export function UnderlineIndicator({ box }: { box: SelectionBox | null }) {
  if (!box) return null;
  return (
    <span
      aria-hidden
      className={`${indicatorMotion} h-0.5 rounded-full bg-violet-600`}
      style={{
        width: box.width,
        transform: `translate3d(${box.x}px, ${box.y + box.height - 2}px, 0)`,
      }}
    />
  );
}

type SeriesOption<T extends string> = { value: T; label: string };

export function SeriesToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly SeriesOption<T>[];
  onChange: (value: T) => void;
}) {
  const { rootRef, box } = useSlidingSelection(value, "[data-sliding-active='true']");

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + delta + options.length) % options.length;
    onChange(options[nextIndex].value);
    event.currentTarget.querySelectorAll("button")[nextIndex]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative inline-flex w-fit rounded-full bg-slate-100 p-1"
      role="group"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <PillIndicator box={box} />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            data-sliding-active={selected ? "true" : "false"}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${selected ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const panelEnter = "animate-in fade-in duration-300 ease-out motion-reduce:animate-none";
