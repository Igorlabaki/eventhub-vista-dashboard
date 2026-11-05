import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthYearNavigatorProps {
  selectedYear: number;
  selectedMonth: number;
  monthNames: string[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onSelectAll?: () => void;
  allSelected?: boolean;
  className?: string;
}

export function MonthYearNavigator({
  selectedYear,
  selectedMonth,
  monthNames,
  onYearChange,
  onMonthChange,
  onSelectAll,
  allSelected = false,
  className,
}: MonthYearNavigatorProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="mb-4 flex items-center justify-center">
        <div className="flex items-center rounded-full border bg-white px-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onYearChange(selectedYear - 1)}
            className="px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 font-semibold">{selectedYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onYearChange(selectedYear + 1)}
            className="px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={onSelectAll
        ? "grid grid-cols-6 gap-2 md:grid-cols-[repeat(13,minmax(0,1fr))]"
        : "grid grid-cols-6 md:grid-cols-12 gap-2"}>
        {monthNames.map((month, index) => (
          <Button
            key={month}
            variant={selectedMonth === index ? "default" : "outline"}
            className={`${selectedMonth === index ? "bg-primary text-white" : "bg-white"} rounded-full py-1 px-2 text-sm`}
            onClick={() => onMonthChange(index)}
          >
            {month}
          </Button>
        ))}
        {onSelectAll ? (
          <Button
            type="button"
            variant={allSelected ? "default" : "outline"}
            aria-pressed={allSelected}
            className={`${allSelected ? "bg-primary text-white" : "bg-white"} rounded-full py-1 px-2 text-sm`}
            onClick={onSelectAll}
          >
            Anual
          </Button>
        ) : null}
      </div>
    </div>
  );
} 