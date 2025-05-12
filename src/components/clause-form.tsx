
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Clause } from "@/types/contract"
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
import { DynamicFieldSelector } from "@/components/ui/dynamic-field-selector"

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
})

interface ClauseFormProps {
  onSubmit: (data: Partial<Clause>) => void;
  initialData?: Partial<Clause>;
  isEditing?: boolean;
}

export function ClauseForm({ onSubmit, initialData, isEditing = false }: ClauseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
  })
  
  const contentRef = React.useRef<HTMLTextAreaElement>(null)
  
  const handleInsertDynamicField = (field: string) => {
    if (!contentRef.current) return
    
    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const currentContent = form.getValues("content")
    const newContent = 
      currentContent.substring(0, start) + 
      `{{${field}}}` + 
      currentContent.substring(end)
    
    form.setValue("content", newContent)
    
    // Set cursor position after the inserted field
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + field.length + 4 // +4 for the {{ and }}
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...initialData,
      title: values.title,
      content: values.content,
    })
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título da cláusula" {...field} />
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
                  placeholder="Digite o conteúdo da cláusula" 
                  className="min-h-[200px]" 
                  {...field} 
                  ref={(e) => {
                    field.ref(e)
                    contentRef.current = e as HTMLTextAreaElement
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="bg-muted p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Inserir campos dinâmicos</h4>
          <DynamicFieldSelector 
            onSelectField={(field) => handleInsertDynamicField(field)}
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
