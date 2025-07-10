import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProposalStore } from "@/store/proposalStore";
import { ProposalType, TrafficSource } from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { useServiceStore } from "@/store/serviceStore";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CreateProposalPerPersonDTO } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { useVenueStore } from "@/store/venueStore";

interface PerPersonProposalFormProps {
  venueId: string;
  onBack: () => void;
}

function formatWhatsapp(value: string) {
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length > 0) {
    return `(${value}`;
  }
  return "";
}

function clampHour(value: string) {
  if (!value) return value;
  return value;
}

function formatHourToHalfHour(value: string) {
  if (!value) return value;
  
  const [hours, minutes] = value.split(':').map(Number);
  
  // Se os minutos são 0, mantém como está (hora cheia)
  if (minutes === 0) {
    return value;
  }
  
  // Se os minutos são 30, mantém como está (meia hora)
  if (minutes === 30) {
    return value;
  }
  
  // Para qualquer outro valor, arredonda para a meia hora mais próxima
  if (minutes < 30) {
    return `${hours.toString().padStart(2, '0')}:00`;
  } else {
    return `${hours.toString().padStart(2, '0')}:30`;
  }
}

// Função para gerar opções de horário (hora cheia e meia hora)
function generateTimeOptions(openingHour?: string, closingHour?: string) {
  const options = [];
  
  // Se não há horários definidos, retorna todas as opções
  if (!openingHour && !closingHour) {
    for (let hour = 0; hour <= 23; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
      options.push(`${hourStr}:30`);
    }
    return options;
  }

  // Converter horários para minutos para facilitar comparação
  const openingMinutes = openingHour ? 
    parseInt(openingHour.split(':')[0]) * 60 + parseInt(openingHour.split(':')[1]) : 0;
  const closingMinutes = closingHour ? 
    parseInt(closingHour.split(':')[0]) * 60 + parseInt(closingHour.split(':')[1]) : 24 * 60;

  for (let hour = 0; hour <= 23; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    
    // Hora cheia
    const fullHourMinutes = hour * 60;
    if (fullHourMinutes >= openingMinutes && fullHourMinutes <= closingMinutes) {
      options.push(`${hourStr}:00`);
    }
    
    // Meia hora
    const halfHourMinutes = hour * 60 + 30;
    if (halfHourMinutes >= openingMinutes && halfHourMinutes <= closingMinutes) {
      options.push(`${hourStr}:30`);
    }
  }
  
  return options;
}

export function ClientPerPersonProposalForm({
  venueId,
  onBack,
}: PerPersonProposalFormProps) {
  const navigate = useNavigate();
  const { createProposalPerPerson } = useProposalStore() || {};
  const {
    services = [],
    fetchServices,
    isLoading: isLoadingServices = false,
  } = useServiceStore() || {};
  const { selectedVenue } = useVenueStore() || {};
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const { toast } = useToast() || { toast: () => {} };

  // Função para obter serviços obrigatórios baseado no número de convidados
  const getRequiredServices = (guestNumber: number) => {
    const requiredServices: string[] = [];
    
    // Verificar todos os serviços que são obrigatórios baseado nos atributos rpaRequired e rpaMinPeople
    services.forEach(service => {
      if (service.rpaRequired && service.rpaMinPeople) {
        // O serviço é obrigatório apenas quando o número de convidados atinge o mínimo
        if (guestNumber >= service.rpaMinPeople) {
          requiredServices.push(service.id);
        }
      }
    });
    
    return requiredServices;
  };
  
  // Criar schema dinâmico baseado no selectedVenue
  const createFormSchema = () => {
    const baseSchema = z.object({
      completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
      completeCompanyName: z.string().optional(),
      date: z.string().min(1, "Data do evento é obrigatória"),
      startHour: z.string().min(1, "Horário de início é obrigatório"),
      endHour: z.string().min(1, "Horário de término é obrigatório"),
      guestNumber: z.string().min(1, "Número de convidados é obrigatório"),
      email: z.string().email("E-mail inválido"),
      whatsapp: z.string()
        .min(10, "WhatsApp é obrigatório")
        .refine((val) => {
          const onlyNumbers = val.replace(/\D/g, "");
          // Deve ter entre 10 e 13 dígitos (Brasil)
          if (onlyNumbers.length < 10 || onlyNumbers.length > 13) return false;
          // Não pode ser sequência repetida (ex: 99999999999, 11111111111)
          if (/^(\d)\1{7,}$/.test(onlyNumbers)) return false;
          // Não pode começar com 0
          if (/^0/.test(onlyNumbers)) return false;
          // Não pode ser só DDD (ex: 11999999999 é válido, 1199999999 é inválido)
          return true;
        }, {
          message: "Número de WhatsApp inválido",
        }),
      description: z.string().min(1, "Descrição é obrigatória"),
      knowsVenue: z.boolean(),
      type: z.nativeEnum(ProposalType),
      trafficSource: z.nativeEnum(TrafficSource),
      totalAmountInput: z.string().optional(),
    });

    return baseSchema
      .refine((data) => {
        if (!selectedVenue?.maxGuest) return true;
        const guestNumber = parseInt(data.guestNumber);
        return guestNumber <= selectedVenue.maxGuest;
      }, {
        message: `Número máximo de convidados permitido é ${selectedVenue?.maxGuest || 0}`,
        path: ["guestNumber"],
      })
      .refine((data) => {
        if (!data.startHour || !data.endHour) return true;
        
        const startMinutes = parseInt(data.startHour.split(':')[0]) * 60 + parseInt(data.startHour.split(':')[1]);
        const endMinutes = parseInt(data.endHour.split(':')[0]) * 60 + parseInt(data.endHour.split(':')[1]);
        
        return endMinutes > startMinutes;
      }, {
        message: "O horário de fim deve ser posterior ao horário de início",
        path: ["endHour"],
      });
  };

  const formSchema = createFormSchema();

  useEffect(() => {
    if (venueId && fetchServices) {
      fetchServices(venueId);
    }
  }, [venueId, fetchServices]);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completeClientName: "",
      completeCompanyName: "",
      date: "",
      startHour: "",
      endHour: "",
      guestNumber: "",
      email: "",
      whatsapp: "",
      description: "",
      knowsVenue: false,
      type: ProposalType.EVENT,
      trafficSource: TrafficSource.OTHER,
      totalAmountInput: "",
    },
  });

  // Atualizar serviços obrigatórios quando o número de convidados mudar
  useEffect(() => {
    const guestNumber = parseInt(form.watch('guestNumber') || '0');
    const requiredServices = getRequiredServices(guestNumber);
    
    // Manter serviços já selecionados pelo usuário
    const userSelectedServices = selectedServiceIds.filter(id => 
      !requiredServices.includes(id)
    );
    
    // Combinar serviços obrigatórios com os selecionados pelo usuário
    const newSelectedServices = [...new Set([...requiredServices, ...userSelectedServices])];
    setSelectedServiceIds(newSelectedServices);
  }, [form.watch('guestNumber'), services]);

  if (!venueId) {
    console.error("venueId é obrigatório");
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    if (!createProposalPerPerson) {
      console.error("createProposalPerPerson não está disponível");
      return;
    }

    try {
      const proposalData: CreateProposalPerPersonDTO = {
        date: values.date,
        completeClientName: values.completeClientName,
        venueId,
        endHour: values.endHour,
        whatsapp: values.whatsapp,
        startHour: values.startHour,
        guestNumber: values.guestNumber,
        description: values.description,
        knowsVenue: values.knowsVenue,
        email: values.email,
        serviceIds: selectedServiceIds,
        totalAmountInput: "0",
        type: ProposalType.EVENT,
        trafficSource: values.trafficSource,
      };

      const response = await createProposalPerPerson(proposalData);

      const { title, message } = handleBackendSuccess(
        response,
        "Orçamento criado com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });

      // Redirecionar para a página de visualização da proposta
      if (response?.data?.id) {
        navigate(`/proposal/${response.data.id}/view`);
      } else {
        onBack();
      }
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao criar orçamento. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
      throw error; // Re-throw para que o AsyncActionButton saiba que houve erro
    }
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-4 bg-white p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="completeClientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completeCompanyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@cliente.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={"br"}
                    value={field.value}
                    onChange={field.onChange}
                    inputClass="w-full"
                    placeholder="Digite o número"
                    enableSearch={true}
                    containerClass="w-full"
                    inputStyle={{ width: "100%" }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do evento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Início</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions(selectedVenue?.openingHour, selectedVenue?.closingHour).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                {selectedVenue?.openingHour && selectedVenue?.closingHour && (
                  <p className="text-xs text-gray-500">
                    Horário disponível: {selectedVenue.openingHour} - {selectedVenue.closingHour}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Fim</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions(selectedVenue?.openingHour, selectedVenue?.closingHour).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                {selectedVenue?.openingHour && selectedVenue?.closingHour && (
                  <p className="text-xs text-gray-500">
                    Horário disponível: {selectedVenue.openingHour} - {selectedVenue.closingHour}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guestNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Convidados</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 100" 
                    max={selectedVenue?.maxGuest || undefined}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                {selectedVenue?.maxGuest && (
                  <p className="text-xs text-gray-500">
                    Máximo de convidados: {selectedVenue.maxGuest}
                  </p>
                )}
              </FormItem>
            )}
          />

   
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes do evento"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="knowsVenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Já conhece o espaço?</FormLabel>
              <FormControl>
                <Select
                  value={field.value === true ? "sim" : "nao"}
                  onValueChange={(v) => field.onChange(v === "sim")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Serviços
          </label>
          {isLoadingServices ? (
            <div>Carregando serviços...</div>
          ) : services && services.length > 0 ? (
            <div className="flex flex-col md:flex-row flex-wrap gap-3 mt-2">
              {services.map((service) => {
                const guestNumber = parseInt(form.watch('guestNumber') || '0');
                const requiredServices = getRequiredServices(guestNumber);
                const isRequired = requiredServices.includes(service.id);
                
                let requiredText = '';
                if (service.rpaRequired && service.rpaMinPeople) {
                  requiredText = ` (Obrigatório - ${service.rpaMinPeople}+ pessoas)`;
                }

                return (
                  <label key={service.id} className={`flex items-center gap-2 ${isRequired ? 'opacity-75' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      disabled={isRequired}
                      onChange={(e) => {
                        if (!isRequired) {
                          if (e.target.checked) {
                            setSelectedServiceIds((ids) => [...ids, service.id]);
                          } else {
                            setSelectedServiceIds((ids) =>
                              ids.filter((id) => id !== service.id)
                            );
                          }
                        }
                      }}
                    />
                    <span className={isRequired ? 'font-medium text-[13px]' : 'text-[13px]'}>
                      {service.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      (R$ {service.price.toFixed(2)})
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-2">Nenhum serviço disponível</div>
          )}
        </div>

        <FormField
          control={form.control}
          name="trafficSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Onde nos achou?</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAFFIC_SOURCE_OPTIONS.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <AsyncActionButton
            onClick={async () => {
              const isValid = await form.trigger();
              if (!isValid) {
                throw new Error("Por favor, corrija os erros no formulário");
              }
              const values = form.getValues();
              await onSubmit(values);
            }}
            label="Enviar"
          />
        </div>
      </form>
    </FormProvider>
  );
}
