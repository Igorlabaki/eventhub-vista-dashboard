import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnderlineIndicator, useSlidingSelection } from "./SlidingSelection";

interface ReportsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function ReportsHeader({ activeTab, onTabChange, selectedYear, onYearChange }: ReportsHeaderProps) {
  const { rootRef, box } = useSlidingSelection(activeTab, "[data-state='active']");
  const trigger = "rounded-none px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 transition-colors duration-200 ease-out motion-reduce:transition-none data-[state=active]:bg-transparent data-[state=active]:text-violet-700 data-[state=active]:shadow-none";

  return (
    <div className="mb-6 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList ref={rootRef} className="relative h-11 rounded-full border bg-white p-1 shadow-sm">
          <UnderlineIndicator box={box} />
          <TabsTrigger value="orcamentos" className={trigger}>ORÇAMENTOS</TabsTrigger>
          <TabsTrigger value="evento" className={trigger}>EVENTO</TabsTrigger>
          <TabsTrigger value="balanco" className={trigger}>FINANCEIRO</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="inline-flex items-center justify-self-center gap-2 rounded-full border bg-white px-2 py-1 shadow-sm">
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 hover:text-violet-600"
          aria-label="Ano anterior"
          onClick={() => onYearChange(String(Number(selectedYear) - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-12 text-center text-sm font-semibold text-slate-800">{selectedYear}</span>
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 hover:text-violet-600"
          aria-label="Próximo ano"
          onClick={() => onYearChange(String(Number(selectedYear) + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
