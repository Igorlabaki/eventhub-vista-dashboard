import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contract } from "@/types/contract";

interface ContractItemProps {
  contract: Contract;
  onClick?: (contract: Contract) => void;
  isSelected?: boolean;
  index?: number;
}

export function ContractItem({ contract, onClick, isSelected, index }: ContractItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(contract);
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
        <span className="font-medium">{contract.name}</span>
        {index !== undefined && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {index}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
} 