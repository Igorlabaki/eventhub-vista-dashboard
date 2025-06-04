import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EventMonthYearNavigatorProps {
  selectedYear: number;
  selectedMonth: number;
  monthNames: string[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export function EventMonthYearNavigator({
  selectedYear,
  selectedMonth,
  monthNames,
  onYearChange,
  onMonthChange,
}: EventMonthYearNavigatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(selectedYear - 1)}
          className="px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="mx-2 font-medium text-lg">{selectedYear}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(selectedYear + 1)}
          className="px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {monthNames.map((month, index) => (
          <Button
            key={month}
            variant={selectedMonth === index ? "default" : "outline"}
            className={`${
              selectedMonth === index ? "bg-primary text-white" : "bg-background"
            } py-1 px-2 text-sm`}
            onClick={() => onMonthChange(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
} 