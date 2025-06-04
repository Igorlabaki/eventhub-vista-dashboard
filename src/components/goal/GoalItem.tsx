import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@/types/goal";

interface GoalItemProps {
  goal: Goal;
  onClick?: (goal: Goal) => void;
  isSelected?: boolean;
  index?: number;
}

export function GoalItem({ goal, onClick, isSelected, index }: GoalItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(goal);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isSelected && "border-primary"
      )}
      onClick={handleClick}
    >
      <CardContent className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <span className="font-medium">
          {goal.minValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
        {index !== undefined && (
          <span className="ml-2 text-xs text-gray-500">{index + 1}</span>
        )}
      </CardContent>
    </Card>
  );
} 