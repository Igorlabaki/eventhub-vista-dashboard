import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useProposalStore } from "@/store/proposalStore";
import { FormLayout } from "@/components/ui/form-layout";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalType, TrafficSource } from "@/types/proposal";
import { NumericFormat } from 'react-number-format';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Textarea } from "@/components/ui/textarea";
import { useServiceStore } from "@/store/serviceStore";
import { useVenueStore } from "@/store/venueStore";
import ProposalEditSkeleton from "@/components/proposal/ProposalEditSkeleton";
import { generateTimeOptions } from "@/components/proposal/forms/PerPersonProposalForm";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";

const proposalTypes = [
  { value: ProposalType.EVENT, label: "Evento" },
  { value: ProposalType.OVERNIGHT, label: "Pernoite" },
  { value: ProposalType.PRODUCTION, label: "Produção" },
  { value: ProposalType.BARTER, label: "Troca" },
  { value: ProposalType.OTHER, label: "Outro" },
] as const;

const trafficSources = [
  { value: TrafficSource.AIRBNB, label: "Airbnb" },
  { value: TrafficSource.GOOGLE, label: "Google" },
  { value: TrafficSource.INSTAGRAM, label: "Instagram" },
  { value: TrafficSource.TIKTOK, label: "TikTok" },
  { value: TrafficSource.FACEBOOK, label: "Facebook" },
  { value: TrafficSource.FRIEND, label: "Indicação" },
  { value: TrafficSource.OTHER, label: "Outro" },
] as const;

const editProposalSchema = z.object({
  proposalId: z.string(),
  data: z.object({
    completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
    completeCompanyName: z.string().optional(),
    email: z.string().email("Email inválido"),
    whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
    guestNumber: z.string().min(1, "Número de convidados é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    knowsVenue: z.boolean(),
    type: z.nativeEnum(ProposalType),
    trafficSource: z.nativeEnum(TrafficSource),
    totalAmountInput: z.string().min(1, "Valor total é obrigatório"),
    serviceIds: z.array(z.string()).default([]),
    date: z.string().min(1, "Data do evento é obrigatória"),
    startHour: z.string().min(1, "Horário de início é obrigatório"),
    endHour: z.string().min(1, "Horário de fim é obrigatório"),
  }),
});

type EditProposalFormValues = z.infer<typeof editProposalSchema>;

export default function ProposalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProposalById, updateProposalPerPerson, currentProposal, isLoading, deleteProposal } = useProposalStore();
  const { services, fetchServices, isLoading: isLoadingServices } = useServiceStore();
  const { selectedVenue } = useVenueStore();
  const form = useForm<EditProposalFormValues>({
    resolver: zodResolver(editProposalSchema),
    defaultValues: {
      proposalId: id,
      data: {
        completeClientName: "",
        completeCompanyName: "",
        email: "",
        whatsapp: "",
        guestNumber: "",
        description: "",
        knowsVenue: false,
        type: ProposalType.EVENT,
        trafficSource: TrafficSource.OTHER,
        totalAmountInput: "",
        serviceIds: [],
        date: "",
        startHour: "",
        endHour: "",
      },
    },
  });

  useEffect(() => {
    if (id && id.trim() !== '') {
      fetchProposalById(id);
    }
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (currentProposal && currentProposal.id) {
      form.reset({
        proposalId: currentProposal.id,
        data: {
          completeClientName: currentProposal.completeClientName || "",
          completeCompanyName: currentProposal.completeCompanyName || "",
          email: currentProposal.email || "",
          whatsapp: currentProposal.whatsapp || "",
          guestNumber: currentProposal.guestNumber?.toString() || "",
          description: currentProposal.description || "",
          knowsVenue: currentProposal.knowsVenue || false,
          type: currentProposal.type || ProposalType.EVENT,
          trafficSource: currentProposal.trafficSource || TrafficSource.OTHER,
          totalAmountInput: currentProposal.totalAmount?.toString() || "",
          serviceIds: (currentProposal.proposalServices || []).map(service => service.serviceId),
          date: currentProposal.startDate ? new Date(currentProposal.startDate).toISOString().split('T')[0] : '',
          startHour: currentProposal.startDate ? new Date(currentProposal.startDate).toISOString().substring(11, 16) : '',
          endHour: currentProposal.endDate ? new Date(currentProposal.endDate).toISOString().substring(11, 16) : '',
        },
      });
    }
  }, [currentProposal, form]);

  useEffect(() => {
    if (currentProposal?.venueId && currentProposal.venueId.trim() !== '') {
      fetchServices(currentProposal.venueId);
    }
  }, [currentProposal?.venueId, fetchServices]);

  const onSubmit = async (data: EditProposalFormValues) => {
    try {
      const response = await updateProposalPerPerson({
        proposalId: data.proposalId,
        data: {
          completeClientName: data.data.completeClientName,
          completeCompanyName: data.data.completeCompanyName,
          date: data.data.date,
          venueId: currentProposal?.venueId || '',
          endHour: data.data.endHour,
          whatsapp: data.data.whatsapp,
          startHour: data.data.startHour,
          guestNumber: data.data.guestNumber,
          description: data.data.description,
          knowsVenue: data.data.knowsVenue,
          email: data.data.email,
          totalAmountInput: data.data.totalAmountInput,
          serviceIds: data.data.serviceIds,
          type: data.data.type,
          trafficSource: data.data.trafficSource,
        },
      });

      const { title, message } = handleBackendSuccess(response, "Orçamento atualizado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      
      // Recarregar a proposta para garantir que temos os dados mais atualizados
      navigate(`/proposal/${id}`)
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar orçamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!currentProposal) return;
    try {
      await deleteProposal(currentProposal.id);
      showSuccessToast({
        title: "Orçamento excluído",
        description: "O orçamento foi excluído com sucesso."
      });
      navigate(`/venue/${selectedVenue.id}/budgets`)
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir orçamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_INFO");
  };

  if (!hasViewPermission()) {
    return (
      <DashboardLayout
        title="Editar Orçamento"
        subtitle="Edite as informações do orçamento"
      >
        <AccessDenied />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Orçamento">
      {!currentProposal ? (
        <ProposalEditSkeleton />
      ) : (
        <FormLayout
          form={form}
          title="Editar Orçamento"
          onSubmit={onSubmit}
          onCancel={() => navigate(`/proposal/${id}`)}
          submitLabel="Atualizar"
          isSubmitting={isLoading}
          isEditing={true}
          onDelete={handleDelete}
          entityName={currentProposal?.completeClientName}
          entityType="orçamento"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data.completeClientName"
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
                name="data.completeCompanyName"
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
              <FormField
                control={form.control}
                name="data.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@cliente.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.whatsapp"
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
                name="data.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do evento :</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.startHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Calcular horário de fim automaticamente baseado na duração padrão
                          if (value && selectedVenue?.standardEventDuration) {
                            const [hours, minutes] = value.split(":").map(Number);
                            const endHours = hours + selectedVenue.standardEventDuration;
                            const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            form.setValue('data.endHour', endTime);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.endHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data.guestNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Convidados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.totalAmountInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="data.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os detalhes do evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.knowsVenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Já conhece o espaço?</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value === true ? "sim" : "nao"}
                      onValueChange={v => field.onChange(v === "sim")}
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

            <FormField
              control={form.control}
              name="data.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo do aluguel:</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {proposalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Serviços</FormLabel>
              {isLoadingServices ? (
                <div>Carregando serviços...</div>
              ) : (
                <div className="flex flex-wrap gap-3 mt-2">
                  {(services || []).map(service => (
                    <label key={service.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.watch("data.serviceIds").includes(service.id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          const current = form.watch("data.serviceIds");
                          if (checked) {
                            form.setValue("data.serviceIds", [...current, service.id]);
                          } else {
                            form.setValue("data.serviceIds", current.filter(id => id !== service.id));
                          }
                        }}
                      />
                      {service.name} <span className="text-xs text-gray-500">(R$ {service.price.toFixed(2)})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="data.trafficSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Onde nos achou?</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {trafficSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormLayout>
      )}
    </DashboardLayout>
  );
} 