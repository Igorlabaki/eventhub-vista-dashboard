import { ReactNode } from "react";
import { LucideIcon, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_FILTER_OPTIONS, CategoryFilterValue, EMPTY_BLOCK_LABEL, blockErrorMessage } from "./report-blocks";

interface ReportBlockProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  isEmpty: boolean;
  className?: string;
  children: ReactNode;
}

export function ReportBlock({ icon: Icon, title, subtitle, actions, isLoading, error, onRetry, isEmpty, className = "", children }: ReportBlockProps) {
  return (
    <section className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`} aria-busy={isLoading}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {isLoading ? (
        <div className="space-y-3" aria-label={`Carregando ${title}`}>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center" role="alert">
          <p className="text-sm text-slate-600">{blockErrorMessage(error)}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Tentar de novo
          </button>
        </div>
      ) : isEmpty ? (
        <p className="py-10 text-center text-sm text-slate-500">{EMPTY_BLOCK_LABEL}</p>
      ) : (
        children
      )}
    </section>
  );
}

export function CategoryFilter({ value, onChange }: { value: CategoryFilterValue; onChange: (value: CategoryFilterValue) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as CategoryFilterValue)}>
      <SelectTrigger className="h-9 w-52 rounded-full text-sm" aria-label="Filtrar por categoria do evento">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MeterBar({ percent, color = "#7c3aed", label }: { percent: number; color?: string; label?: string }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative h-2.5 flex-1 rounded-full bg-slate-100" aria-hidden={label ? undefined : true} aria-label={label}>
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}
