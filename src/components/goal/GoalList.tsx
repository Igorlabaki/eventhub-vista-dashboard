import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterList } from "@/components/filterList";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Goal } from "@/types/goal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { monthsList } from "./GoalsTab";

const monthLabels = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

interface GoalListProps {
  goals: Goal[];
  onDeleteGoal?: (goal: Goal) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  selectedGoalIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (goal: Goal) => void;
}

export function GoalList({
  goals,
  onDeleteGoal,
  searchPlaceholder = "Filtrar metas...",
  emptyMessage = "Nenhuma meta encontrada",
  className,
  selectedGoalIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: GoalListProps) {
  if (isLoading) {
    // Use GoalListSkeleton se quiser
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <FilterList
        items={goals}
        filterBy={(goal, query) =>
          goal.minValue.toString().includes(query) ||
          (goal.maxValue && goal.maxValue.toString().includes(query))
        }
        placeholder={searchPlaceholder}
      >
        {(filteredGoals) =>
          filteredGoals?.length === 0 ? (
            <EmptyState
              title={emptyMessage}
              actionText="Nova Meta"
              onAction={onCreateClick}
            />
          ) : (
            <Table className="bg-white rounded-md shadow-lg ">
              <TableHeader>
                <TableRow>
                  <TableHead>Meta</TableHead>
                  <TableHead>Meses</TableHead>
                  <TableHead>Taxa de Aumento (%)</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGoals.map((goal) => {
                  // Meses formatados
                  const monthNames = goal.months
                    .split(',')
                    .map(m => monthsList.find(month => month.value === m.trim())?.display)
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <TableRow
                      key={goal.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedGoalIds.includes(goal.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell
                        className="font-medium cursor-pointer"
                        onClick={() => onEditClick(goal)}
                      >
                        {goal.minValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        {goal.maxValue ? ` - ${goal.maxValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}
                      </TableCell>
                      <TableCell>{monthNames}</TableCell>
                      <TableCell>{goal.increasePercent}%</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(goal);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDeleteGoal) onDeleteGoal(goal);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )
        }
      </FilterList>
    </div>
  );
} 