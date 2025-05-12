
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clause } from "@/types/contract"

interface ClauseItemProps {
  clause: Clause
  onClick?: (clause: Clause) => void
  isSelected?: boolean
  index?: number
}

export function ClauseItem({ clause, onClick, isSelected, index }: ClauseItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick(clause)
    }
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isSelected && "border-primary"
      )}
      onClick={handleClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <span className="font-medium">{clause.title}</span>
        {index !== undefined && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {index}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
