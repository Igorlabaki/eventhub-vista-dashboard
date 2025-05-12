
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Schema for form validation
const createProposalSchema = z.object({
  date: z.string().nonempty("A data é obrigatória"),
  completeClientName: z.string().nonempty("O nome do cliente é obrigatório"),
  venueId: z.string().nonempty("O espaço é obrigatório"),
  endHour: z.string().nonempty("A hora de término é obrigatória"),
  whatsapp: z.string().nonempty("O WhatsApp é obrigatório"),
  startHour: z.string().nonempty("A hora de início é obrigatória"),
  guestNumber: z.string().nonempty("O número de convidados é obrigatório"),
  description: z.string().nonempty("A descrição é obrigatória"),
  knowsVenue: z.boolean(),
  email: z.string().email("Email inválido"),
  serviceIds: z.array(z.string()),
  totalAmountInput: z.string().optional(),
  type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT"]),
  trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]),
});

type FormValues = z.infer<typeof createProposalSchema>;

export default function NewBudget() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Default form values
  const defaultValues: Partial<FormValues> = {
    venueId: "1", // Default venue ID
    serviceIds: [],
    knowsVenue: false,
    type: "EVENT",
    trafficSource: "OTHER",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    
    toast({
      title: "Orçamento criado com sucesso!",
      description: `Orçamento para ${data.completeClientName} enviado.`,
    });
    
    // Navigate back to the budgets page
    navigate("/venue/budgets");
  };

  return (
    <DashboardLayout title="Novo Orçamento" subtitle="Crie um novo orçamento para seu cliente">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Orçamento</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="completeClientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Evento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guestNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Convidados</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EVENT">Evento</SelectItem>
                          <SelectItem value="PRODUCTION">Produção</SelectItem>
                          <SelectItem value="BARTER">Permuta</SelectItem>
                          <SelectItem value="OTHER">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trafficSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como nos conheceu</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                          <SelectItem value="FACEBOOK">Facebook</SelectItem>
                          <SelectItem value="GOOGLE">Google</SelectItem>
                          <SelectItem value="TIKTOK">TikTok</SelectItem>
                          <SelectItem value="AIRBNB">Airbnb</SelectItem>
                          <SelectItem value="FRIEND">Indicação</SelectItem>
                          <SelectItem value="OTHER">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="knowsVenue"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Já conhece o espaço?
                      </FormLabel>
                      <FormDescription>
                        Indique se o cliente já visitou o espaço anteriormente.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Evento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o evento..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totalAmountInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para calcular automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/venue/budgets")}>
                Cancelar
              </Button>
              <Button type="submit">Criar Orçamento</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
