
import * as React from "react"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/ui/search-input"
import { ClauseItem } from "@/components/ui/clause-item"
import { Clause } from "@/types/contract"

interface ClauseListProps {
  clauses: Clause[]
  onClauseClick: (clause: Clause) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  selectedClauseIds?: string[]
}

export function ClauseList({
  clauses,
  onClauseClick,
  searchPlaceholder = "Filtrar cláusulas...",
  emptyMessage = "Nenhuma cláusula encontrada",
  className,
  selectedClauseIds = []
}: ClauseListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredClauses = React.useMemo(() => {
    return clauses.filter((clause) => 
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [clauses, searchTerm])

  return (
    <div className={cn("space-y-4", className)}>
      <SearchInput
        placeholder={searchPlaceholder}
        onSearch={setSearchTerm}
      />

      <div className="space-y-3">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          filteredClauses.map((clause) => (
            <ClauseItem
              key={clause.id}
              clause={clause}
              onClick={onClauseClick}
              isSelected={selectedClauseIds.includes(clause.id)}
              index={selectedClauseIds.indexOf(clause.id) >= 0 ? selectedClauseIds.indexOf(clause.id) + 1 : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
