
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface Venue {
  id: string
  name: string
}

interface VenueItemProps {
  venue: Venue
  onClick?: (venue: Venue) => void
  badge?: React.ReactNode
}

export function VenueItem({ venue, onClick, badge }: VenueItemProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(venue)}
    >
      <CardContent className="flex items-center justify-between p-4">
        <span className="font-medium">{venue.name}</span>
        {badge}
      </CardContent>
    </Card>
  )
}

interface VenueListProps {
  venues: Venue[]
  onVenueClick: (venue: Venue) => void
  emptyMessage?: string
  renderBadge?: (venue: Venue) => React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export function VenueList({
  venues,
  onVenueClick,
  emptyMessage = "Nenhum espaço encontrado",
  renderBadge,
  className,
  title,
  subtitle
}: VenueListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p className="text-sm text-gray-500 mb-4">
          {subtitle}
        </p>
      )}

      <div className="space-y-3">
        {venues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          venues.map((venue) => (
            <VenueItem
              key={venue.id}
              venue={venue}
              onClick={onVenueClick}
              badge={renderBadge?.(venue)}
            />
          ))
        )}
      </div>
    </div>
  )
}
