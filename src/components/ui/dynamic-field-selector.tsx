import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DynamicField, fieldGroups } from "@/types/contract"

interface DynamicFieldSelectorProps {
  onSelectField: (field: DynamicField, display: string) => void;
}

export function DynamicFieldSelector({ onSelectField }: DynamicFieldSelectorProps) {
  // Add stop propagation to prevent modal from closing
  const handleButtonClick = (field: DynamicField, display: string) => (e: React.MouseEvent) => {
  
    e.preventDefault()
    e.stopPropagation()
    onSelectField(field, display)
  }

  return (
      <Tabs defaultValue={fieldGroups[0].name} className="w-full">
        <TabsList className="flex flex-wrap gap-2  bg-transparent p-0 border-none mb-10 md:mb-4">
          {fieldGroups.map((group) => (
            <TabsTrigger 
              key={group.name} 
              value={group.name} 
              className="px-3 py-1 rounded-lg border bg-white shadow-sm text-violet-700 font-semibold transition-colors data-[state=active]:bg-violet-100 data-[state=active]:border-violet-500 data-[state=active]:text-violet-900 text-xs"
            >
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {fieldGroups.map((group) => (
          <TabsContent 
            key={group.name} 
            value={group.name} 
            className="mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.fields.map((field) => (
                <Button
                  key={field.id}
                  variant="outline"
                  size="sm"
                  className="px-3 py-2 rounded-lg bg-white border shadow-sm hover:bg-violet-50 transition font-medium text-xs"
                  onClick={handleButtonClick(field.id, field.display)}
                >
                  {field.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

  )
}
