import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ClauseItem } from "@/components/contract/clauses/clause-item"
import { Contract } from "@/types/contract"
import { Venue } from "@/components/ui/venue-list"
import { Clause } from "@/types/clause"
import { FormLayout } from "@/components/ui/form-layout"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  title: z.string().min(1, "Cabeçalho é obrigatório"),
})

type ContractClausePayload = {
  text: string;
  title: string;
  position: number;
  id?: string;
};
type ContractPayload = {
  name: string;
  title: string;
  venues: Venue[];
  clauses: ContractClausePayload[];
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

function resolveClauseById(
  id: string,
  isEditing: boolean,
  initialData: Partial<Contract> | undefined,
  libraryClauses: Clause[]
): Clause | undefined {
  if (isEditing) {
    return (
      initialData?.clauses?.find((c) => c.id === id) ??
      libraryClauses.find((c) => c.id === id)
    );
  }
  return libraryClauses.find((c) => c.id === id);
}

export function ContractForm({
  onSubmit,
  initialData,
  isEditing = false,
  clauses,
  venues,
  onCancel = () => {},
  onDelete,
}: ContractFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      title: initialData?.title || "",
    },
  })

  const [selectedClauseIds, setSelectedClauseIds] = React.useState<string[]>(
    initialData?.clauses?.map((clause) => clause.id) || []
  )

  const [selectedVenueIds, setSelectedVenueIds] = React.useState<string[]>(
    initialData?.venues?.map((venue) => venue.id) || []
  )

  const [searchTerm, setSearchTerm] = useState("")

  const contractClauseIds = new Set(
    (initialData?.clauses || []).map((c) => c.id)
  )

  const filteredClauses = clauses.filter((clause) =>
    clause.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedClausesInOrder = selectedClauseIds
    .map((id) => resolveClauseById(id, isEditing, initialData, clauses))
    .filter(Boolean) as Clause[]

  const getLibraryClauseSelectedIndex = (libraryClause: Clause): number | undefined => {
    const libIdx = selectedClauseIds.indexOf(libraryClause.id)
    if (libIdx !== -1) return libIdx + 1

    if (isEditing && initialData?.clauses) {
      const contractCopy = initialData.clauses.find(
        (c) =>
          c.title === libraryClause.title &&
          c.text === libraryClause.text &&
          selectedClauseIds.includes(c.id)
      )
      if (contractCopy) {
        return selectedClauseIds.indexOf(contractCopy.id) + 1
      }
    }
    return undefined
  }

  const isLibraryClauseSelected = (libraryClause: Clause): boolean =>
    getLibraryClauseSelectedIndex(libraryClause) !== undefined

  const handleClauseClick = (libraryClause: Clause) => {
    setSelectedClauseIds((prev) => {
      if (prev.includes(libraryClause.id)) {
        return prev.filter((id) => id !== libraryClause.id)
      }

      if (isEditing && initialData?.clauses) {
        const contractCopy = initialData.clauses.find(
          (c) =>
            c.title === libraryClause.title &&
            c.text === libraryClause.text &&
            prev.includes(c.id)
        )
        if (contractCopy) {
          return prev.filter((id) => id !== contractCopy.id)
        }
      }

      return [...prev, libraryClause.id]
    })
  }

  const removeSelectedClause = (id: string) => {
    setSelectedClauseIds((prev) => prev.filter((clauseId) => clauseId !== id))
  }

  const moveClause = (index: number, direction: "up" | "down") => {
    setSelectedClauseIds((prev) => {
      const next = [...prev]
      const target = direction === "up" ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleVenueToggle = (venueId: string) => {
    setSelectedVenueIds((prev) => {
      if (prev.includes(venueId)) {
        return prev.filter((id) => id !== venueId)
      }
      return [...prev, venueId]
    })
  }

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedClauses: ContractClausePayload[] = selectedClauseIds
      .map((id, idx) => {
        const clause = resolveClauseById(id, isEditing, initialData, clauses)
        if (!clause) return null

        const payload: ContractClausePayload = {
          text: clause.text,
          title: clause.title,
          position: idx + 1,
        }

        if (isEditing && contractClauseIds.has(id)) {
          payload.id = id
        }

        return payload
      })
      .filter(Boolean) as ContractClausePayload[]

    onSubmit({
      ...initialData,
      name: values.name,
      title: values.title,
      venues: venues.filter((v) => selectedVenueIds.includes(v.id)),
      clauses: selectedClauses,
    })
  }

  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      title: initialData?.title || "",
    })
    setSelectedClauseIds(
      (initialData?.clauses || [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((clause) => clause.id)
        .filter(Boolean)
    )
    setSelectedVenueIds(initialData?.venues?.map((venue) => venue.id) || [])
  }, [initialData?.id, form, clauses])

  const handleDelete = async () => {
    if (!initialData?.id) return
    try {
      await onDelete?.(initialData.id)
      onCancel()
    } catch {
      // erro tratado pelo caller
    }
  }

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
          <label className="block font-medium mb-1">
            Cláusulas selecionadas (ordem do contrato)
          </label>
          <div className="bg-muted rounded-md p-2 mt-2">
            {selectedClausesInOrder.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">
                Nenhuma cláusula selecionada. Adicione cláusulas da biblioteca abaixo.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedClauseIds.map((id, index) => {
                  const clause = selectedClausesInOrder[index]
                  if (!clause) return null

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-md border bg-background p-3"
                    >
                      <Badge variant="secondary" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="flex-1 font-medium text-sm truncate">
                        {clause.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => moveClause(index, "up")}
                          aria-label="Mover cláusula para cima"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === selectedClauseIds.length - 1}
                          onClick={() => moveClause(index, "down")}
                          aria-label="Mover cláusula para baixo"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeSelectedClause(id)}
                          aria-label="Remover cláusula"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Biblioteca de cláusulas</label>
          <div className="bg-muted rounded-md p-2 mt-2">
            <div className="mb-2">
              <Input
                placeholder="Procurar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              {filteredClauses.map((clause) => {
                const selectedIdx = getLibraryClauseSelectedIndex(clause)

                return (
                  <ClauseItem
                    key={clause.id}
                    clause={clause}
                    onClick={() => handleClauseClick(clause)}
                    isSelected={isLibraryClauseSelected(clause)}
                    index={selectedIdx}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </FormLayout>
  )
}
