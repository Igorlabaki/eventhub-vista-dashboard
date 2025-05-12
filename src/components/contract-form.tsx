
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ClauseList } from "@/components/ui/clause-list"
import { Clause, Contract } from "@/types/contract"
import { Venue } from "@/components/ui/venue-list"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})

interface ContractFormProps {
  onSubmit: (data: Partial<Contract>) => void;
  initialData?: Partial<Contract>;
  isEditing?: boolean;
  clauses: Clause[];
  venues: Venue[];
}

export function ContractForm({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  clauses,
  venues 
}: ContractFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  })
  
  const [selectedClauseIds, setSelectedClauseIds] = React.useState<string[]>(
    initialData?.clauses?.map(clause => clause.id) || []
  )
  
  const [selectedVenueIds, setSelectedVenueIds] = React.useState<string[]>(
    initialData?.venueIds || []
  )
  
  const handleClauseClick = (clause: Clause) => {
    setSelectedClauseIds(prev => {
      if (prev.includes(clause.id)) {
        return prev.filter(id => id !== clause.id)
      } else {
        return [...prev, clause.id]
      }
    })
  }
  
  const handleVenueToggle = (venueId: string) => {
    setSelectedVenueIds(prev => {
      if (prev.includes(venueId)) {
        return prev.filter(id => id !== venueId)
      } else {
        return [...prev, venueId]
      }
    })
  }
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedClauses = clauses.filter(clause => 
      selectedClauseIds.includes(clause.id)
    )
    
    onSubmit({
      ...initialData,
      name: values.name,
      description: values.description,
      clauses: selectedClauses,
      venueIds: selectedVenueIds,
    })
  }

  // Prevenir o fechamento do modal ao clicar dentro do formulário
  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
        onClick={handleFormClick}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contrato" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição do contrato" 
                    className="h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-medium mb-3">Selecione as Locações</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {venues.map(venue => (
              <div 
                key={venue.id} 
                className="flex items-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox 
                  id={`venue-${venue.id}`} 
                  checked={selectedVenueIds.includes(venue.id)}
                  onCheckedChange={() => handleVenueToggle(venue.id)}
                />
                <label 
                  htmlFor={`venue-${venue.id}`}
                  className="text-sm cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {venue.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-medium mb-3">Selecione as cláusulas</h3>
          <ClauseList 
            clauses={clauses} 
            onClauseClick={handleClauseClick} 
            selectedClauseIds={selectedClauseIds}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
