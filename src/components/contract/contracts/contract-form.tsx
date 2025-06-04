import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ClauseItem } from "@/components/contract/clauses/clause-item"
import { Contract } from "@/types/contract"
import { Venue } from "@/components/ui/venue-list"
import { Clause } from "@/types/clause"
import { FormLayout } from "@/components/ui/form-layout"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useEffect, useState } from "react"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  title: z.string().min(1, "Cabeçalho é obrigatório"),
})

type ContractClausePayload = { text: string; title: string; position: number };
type ContractPayload = {
  name: string;
  title: string;
  venues: Venue[];
  clauses: ContractClausePayload[];
  // outros campos se necessário
};

interface ContractFormProps {
  onSubmit: (data: ContractPayload) => void;
  initialData?: Partial<Contract>;
  isEditing?: boolean;
  clauses: Clause[];
  venues: Venue[];
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

export function ContractForm({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  clauses,
  venues,
  onCancel = () => {},
  onDelete
}: ContractFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      title: initialData?.title || "",
    },
  })
  
  const [selectedClauseIds, setSelectedClauseIds] = React.useState<string[]>(
    initialData?.clauses?.map(clause => clause.id) || []
  )
  
  const [selectedVenueIds, setSelectedVenueIds] = React.useState<string[]>(
    initialData?.venues?.map(venue => venue.id) || []
  )
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClauses = clauses.filter((clause) =>
    clause.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOG: mostrar selectedClauseIds sempre que mudar
  useEffect(() => {
    console.log("selectedClauseIds:", selectedClauseIds);
  }, [selectedClauseIds]);

  const handleClauseClick = (clause: Clause) => {
    console.log("Clicou na cláusula:", clause.id, clause.title);
    setSelectedClauseIds(prev => {
      if (prev.includes(clause.id)) {
        console.log("Removendo cláusula:", clause.id, clause.title);
        return prev.filter(id => id !== clause.id)
      } else {
        console.log("Adicionando cláusula:", clause.id, clause.title);
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
    const selectedClauses: ContractClausePayload[] = selectedClauseIds.map((id, idx) => {
      const clause = clauses.find((c) => c.id === id);
      return clause
        ? {
            text: clause.text,
            title: clause.title,
            position: idx + 1,
          }
        : null;
    }).filter(Boolean) as ContractClausePayload[];
    onSubmit({
      ...initialData,
      name: values.name,
      title: values.title,
      venues: venues.filter((v) => selectedVenueIds.includes(v.id)),
      clauses: selectedClauses,
    });
  }

  // Resetar o form ao mudar o contrato selecionado
  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      title: initialData?.title || "",
    });
    setSelectedClauseIds(
      (initialData?.clauses || [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((clause) => {
          // Busca o id correto na lista global
          const found = clauses.find(c => c.title === clause.title && c.text === clause.text);
          return found?.id;
        })
        .filter(Boolean)
    );
    setSelectedVenueIds(initialData?.venues?.map((venue) => venue.id) || []);
  }, [initialData?.id, form, clauses]);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await onDelete?.(initialData.id);
      onCancel(); // Fecha o form após deletar
    } catch (error) {
      // Trate erro se quiser
    }
  };

  return (
    <FormLayout
      form={form}
      title={isEditing ? "Editar Contrato" : "Novo Contrato"}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onDelete={handleDelete}
      isEditing={isEditing}
      entityName={initialData?.name}
      entityType="contrato"
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cabeçalho</FormLabel>
              <FormControl>
                <Input placeholder="Cabeçalho do contrato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <label className="block font-medium mb-1">Selecione as Locações:</label>
          <div className="flex flex-wrap gap-4 mt-2">
            {venues.map((venue) => (
              <div key={venue.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`venue-${venue.id}`}
                  checked={selectedVenueIds.includes(venue.id)}
                  onCheckedChange={() => handleVenueToggle(venue.id)}
                />
                <label htmlFor={`venue-${venue.id}`} className="text-sm cursor-pointer">
                  {venue.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Selecione as cláusulas</label>
          <div className="bg-muted rounded-md p-2 mt-2">
            <div className="mb-2">
              <Input
                placeholder="Procurar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              {filteredClauses.map((clause) => {
                const selectedIdx = selectedClauseIds.indexOf(clause.id);
                console.log(`Cláusula: ${clause.title} | id: ${clause.id} | selectedIdx:`, selectedIdx);
                return (
                  <ClauseItem
                    key={clause.id}
                    clause={clause}
                    onClick={() => handleClauseClick(clause)}
                    isSelected={selectedIdx !== -1}
                    index={selectedIdx !== -1 ? selectedIdx + 1 : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </FormLayout>
  )
}
