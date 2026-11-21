import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { personListOverflow, type PersonListOverflow } from "./public-person-list-scroll";

export function PublicPersonListScroll({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<PersonListOverflow>("none");

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller) return;

    const sync = () => {
      const next = personListOverflow(
        scroller.scrollTop,
        scroller.scrollHeight,
        scroller.clientHeight,
      );
      setOverflow((current) => (current === next ? current : next));
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(scroller);
    if (content) observer.observe(content);
    scroller.addEventListener("scroll", sync, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", sync);
    };
  }, []);

  return (
    <div
      ref={scrollerRef}
      data-overflow={overflow}
      className="person-list-scroll scrollbar-house mt-4 max-h-[400px] overflow-x-hidden overflow-y-auto"
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
