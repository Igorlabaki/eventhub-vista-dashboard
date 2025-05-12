
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Attachment } from "@/types/contract"
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

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
})

interface VenueOption {
  id: string;
  name: string;
}

interface AttachmentFormProps {
  onSubmit: (data: Partial<Attachment>) => void;
  initialData?: Partial<Attachment>;
  isEditing?: boolean;
  venues: VenueOption[];
}

export function AttachmentForm({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  venues 
}: AttachmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
  })
  
  const [selectedVenueIds, setSelectedVenueIds] = React.useState<string[]>(
    initialData?.venueIds || []
  )
  
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
    onSubmit({
      ...initialData,
      title: values.title,
      content: values.content,
      venueIds: selectedVenueIds,
    })
  }
  
  // Previnir o fechamento do modal ao clicar em um checkbox
  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4" 
        onClick={handleFormClick}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título do anexo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite o conteúdo do anexo" 
                  className="min-h-[200px]" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <h3 className="text-lg font-medium mb-3">Selecione as Locações:</h3>
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
        
        <div className="flex justify-end">
          <Button type="submit">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
