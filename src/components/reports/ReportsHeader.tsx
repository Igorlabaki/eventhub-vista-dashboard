import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function ReportsHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
  selectedYear,
  onYearChange,
}: ReportsHeaderProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 ">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
              <TabsTrigger
                value="orcamentos"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${activeTab === "orcamentos"
                    ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                    : "border-b-4 border-transparent"}`}
              >
                ORÇAMENTOS
              </TabsTrigger>
              <TabsTrigger
                value="evento"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${activeTab === "evento"
                    ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                    : "border-b-4 border-transparent"}`}
              >
                EVENTO
              </TabsTrigger>
              <TabsTrigger
                value="balanco"
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${activeTab === "balanco"
                    ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                    : "border-b-4 border-transparent"}`}
              >
                BALANÇO FINANCEIRO
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 