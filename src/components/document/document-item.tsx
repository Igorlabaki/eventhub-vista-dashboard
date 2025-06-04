import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Document, DocumentType } from "@/types/document"

interface DocumentItemProps {
  document: Document
  onClick?: (document: Document) => void
  isSelected?: boolean
  index?: number
}

export function DocumentItem({ document, onClick, isSelected, index }: DocumentItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick(document)
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
          <span className="font-medium">{document.title}</span>
          <span className="text-sm text-gray-500">
            {new Date(document.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {document.fileType}
          </Badge>
          {index !== undefined && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {index}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 