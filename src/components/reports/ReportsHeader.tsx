import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const tabs = [
  { value: "orcamentos", label: "ORÇAMENTOS" },
  { value: "evento", label: "EVENTO" },
  { value: "balanco", label: "FINANCEIRO" },
];

export function ReportsHeader({ activeTab, onTabChange, selectedYear, onYearChange }: ReportsHeaderProps) {
  return (
    <div className="mb-6 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1 w-fit">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`px-4 py-2 w-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.value
                  ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                  : "border-b-4 border-transparent"
              }`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
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
