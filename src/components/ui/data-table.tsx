
import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableColumn<T> {
  header: string
  accessorKey: string
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string
  className?: string
  emptyMessage?: string
  isSelectable?: boolean
  rowIcon?: (item: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Buscar...",
  onRowClick,
  keyExtractor,
  className,
  emptyMessage = "Nenhum item encontrado",
  isSelectable = false,
  rowIcon
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null)

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    
    setSortConfig({ key, direction })
  }
  
  const sortedData = React.useMemo(() => {
    let sortableItems = [...data]
    
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    
    return sortableItems
  }, [data, sortConfig])

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return sortedData
    
    return sortedData.filter((item) => {
      return Object.values(item as object).some((value) => 
        value !== null && 
        value !== undefined && 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [sortedData, searchQuery])

  return (
    <div className={cn("w-full space-y-4", className)}>
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {rowIcon && <TableHead className="w-10"></TableHead>}
              {columns.map((column) => (
                <TableHead 
                  key={column.accessorKey}
                  onClick={column.sortable ? () => handleSort(column.accessorKey) : undefined}
                  className={cn(column.sortable && "cursor-pointer select-none")}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig?.key === column.accessorKey && (
                      sortConfig.direction === 'ascending' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={rowIcon ? columns.length + 1 : columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    "transition-colors"
                  )}
                >
                  {rowIcon && (
                    <TableCell>
                      {rowIcon(item)}
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={`${keyExtractor(item)}-${column.accessorKey}`}>
                      {column.cell
                        ? column.cell(item)
                        : (item as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
