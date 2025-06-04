import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DateEvent } from "@/types/dateEvent"
import { formatDate } from "@/lib/utils"

interface DateEventItemProps {
  dateEvent: DateEvent
  onClick?: (dateEvent: DateEvent) => void
  isSelected?: boolean
  index?: number
}

export function DateEventItem({ dateEvent, onClick, isSelected, index }: DateEventItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick(dateEvent)
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
      <CardContent className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <span className="font-medium">{dateEvent.title}</span>
          <div className="text-sm text-gray-500 space-y-1">
            <div>
              <span className="font-medium">Início:</span> {formatDate(dateEvent.startDate)}
            </div>
            <div>
              <span className="font-medium">Fim:</span> {formatDate(dateEvent.endDate)}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {dateEvent.type}
            </div>
          </div>
        </div>
        {index !== undefined && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {index}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
} 