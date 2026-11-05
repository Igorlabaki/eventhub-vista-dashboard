import { Children, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check } from "lucide-react";

export const publicBudgetActionMotion =
  "transition-[transform,box-shadow,background-color] duration-200 ease-out active:translate-y-0 active:scale-[0.98] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md";

export const PUBLIC_BUDGET_STEPS = [
  "Informações pessoais",
  "Informações do evento",
  "Como nos encontrou",
] as const;

export function PublicBudgetStepIndicator({ step }: { step: number }) {
  return (
    <ol aria-label="Etapas do orçamento" className="grid w-full grid-cols-3 items-start gap-3 text-sm">
      {PUBLIC_BUDGET_STEPS.map((label, index) => {
        const current = index === step;
        const done = index < step;
        const align =
          index === 0 ? "justify-self-start text-left" : index === 1 ? "justify-self-center text-center" : "justify-self-end text-right";
        const tone = current ? "font-semibold" : done ? "font-medium" : "opacity-40";
        return (
          <li
            key={label}
            className={`${align} ${tone}`}
            aria-current={current ? "step" : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              {done ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <span>{index + 1}.</span>
              )}
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function PublicBudgetStepStage({ step, children }: { step: number; children: ReactNode }) {
  const panels = Children.toArray(children);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const measure = () => {
      const next = Math.max(0, ...refs.current.map((node) => node?.offsetHeight ?? 0));
      setHeight((current) => (next > 0 && current !== next ? next : current));
    };
    measure();
    const observer = new ResizeObserver(measure);
    refs.current.forEach((node) => {
      if (!node) return;
      observer.observe(node);
      if (node.parentElement) {
        const index = refs.current.indexOf(node);
        if (index === step) node.parentElement.removeAttribute("inert");
        else node.parentElement.setAttribute("inert", "");
      }
    });
    return () => observer.disconnect();
  }, [panels.length, step]);

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <div
        className="flex w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${step * 100}%)` }}
      >
        {panels.map((panel, index) => (
          <div key={index} className="w-full min-w-full shrink-0" aria-hidden={index !== step}>
            <div
              ref={(node) => {
                refs.current[index] = node;
              }}
              className="w-full"
            >
              {panel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicBudgetStepNav({
  step,
  onBack,
  onNext,
  buttonStyle,
  submit,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  buttonStyle?: CSSProperties;
  submit: ReactNode;
}) {
  return (
    <div className="flex justify-end gap-2">
      {step > 0 && (
        <button
          type="button"
          className={`rounded-md border border-current px-6 py-2 font-semibold ${publicBudgetActionMotion}`}
          onClick={onBack}
        >
          Voltar
        </button>
      )}
      {step < PUBLIC_BUDGET_STEPS.length - 1 ? (
        <button
          type="button"
          className={`rounded-md px-6 py-2 font-semibold text-white shadow-md ${publicBudgetActionMotion} ${buttonStyle ? "" : "bg-violet-500 hover:bg-violet-600"}`}
          style={buttonStyle}
          onClick={onNext}
        >
          Continuar
        </button>
      ) : (
        submit
      )}
    </div>
  );
}
