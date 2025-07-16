import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SeasonalFee } from "@/types/seasonalFee";
import { useSeasonalFeeStore } from "@/store/seasonalFeeStore";
import { useVenueStore } from "@/store/venueStore";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import InputMask from "react-input-mask";

const formSchema = z.object({
  title: z.string().min(1, "Obrigatório"),
  fee: z.string().min(1, "Obrigatório"),
  startDay: z.string().optional(),
  endDay: z.string().optional(),
  affectedDays: z.string().optional(),
});

type FeeFormValues = z.infer<typeof formSchema>;

const diasSemana = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

interface FeeFormProps {
  fee?: SeasonalFee | null;
  venueId: string;
  onCancel: () => void;
  onDelete?: () => void;
}

export function FeeForm({ fee, venueId, onCancel, onDelete }: FeeFormProps) {
  const { createSeasonalFee, updateSeasonalFee } = useSeasonalFeeStore();
  const { toast } = useToast();
  const { selectedVenue: venue } = useVenueStore();
  // Estado para tipo de seleção
  const [tipoSelecao, setTipoSelecao] = useState<"periodo" | "dias">(
    fee?.startDay && fee?.endDay ? "periodo" : "dias"
  );
  // Estado para dias selecionados
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(
    fee?.affectedDays ? fee.affectedDays.split(",") : []
  );

  const form = useForm<FeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fee ? {
      title: fee.title,
      fee: fee.fee.toString(),
      startDay: fee.startDay || "",
      endDay: fee.endDay || "",
      affectedDays: fee.affectedDays || "",
    } : {
      title: "",
      fee: "",
      startDay: "",
      endDay: "",
      affectedDays: "",
    },
  });

  // Função para formatar data de YYYY-MM-DD para DD/MM
  const formatDateToDDMM = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Função para converter data de DD/MM para YYYY-MM-DD (usando ano atual)
  const formatDateToYYYYMMDD = (dateString: string): string => {
    if (!dateString || !dateString.includes('/')) return "";
    const [day, month] = dateString.split('/');
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Função para criar uma data válida para o input (usando ano atual)
  const createValidDateForInput = (day: number, month: number): string => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Função utilitária para converter Date para DD/MM
  const dateToDDMM = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Função utilitária para converter DD/MM para Date (ano atual)
  const ddmmToDate = (ddmm: string): Date | null => {
    if (!ddmm || !ddmm.includes('/')) return null;
    const [day, month] = ddmm.split('/');
    const year = new Date().getFullYear();
    return new Date(year, Number(month) - 1, Number(day));
  };

  registerLocale("pt-BR", ptBR);

  useEffect(() => {
    if (fee) {
      setTipoSelecao(fee.startDay && fee.endDay ? "periodo" : "dias");
      setDiasSelecionados(fee.affectedDays ? fee.affectedDays.split(",") : []);
      form.reset({
        title: fee.title,
        fee: fee.fee.toString(),
        startDay: fee.startDay ? formatDateToYYYYMMDD(fee.startDay) : "",
        endDay: fee.endDay ? formatDateToYYYYMMDD(fee.endDay) : "",
        affectedDays: fee.affectedDays || "",
      });
    } else {
      setTipoSelecao("periodo");
      setDiasSelecionados([]);
      form.reset({
        title: "",
        fee: "",
        startDay: "",
        endDay: "",
        affectedDays: "",
      });
    }
  }, [fee]);

  const handleSubmit = async (data: FeeFormValues) => {
    try {
      const payload = {
        title: data.title,
        fee: Number(data.fee),
        venueId: venue?.id,
        type: fee?.type || "SURCHARGE",
        startDay: tipoSelecao === "periodo" && data.startDay ? data.startDay : undefined,
        endDay: tipoSelecao === "periodo" && data.endDay ? data.endDay : undefined,
        affectedDays: tipoSelecao === "dias" ? diasSelecionados.join(",") : undefined,
      };
      let response;
      if (fee) {
        response = await updateSeasonalFee({
          seasonalFeeId: fee.id,
          venueId: venue?.id,
          data: payload,
        });
        const { title, message } = handleBackendSuccess(response, "Taxa sazonal atualizada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createSeasonalFee(payload);
        const { title, message } = handleBackendSuccess(response, "Taxa sazonal criada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar taxa sazonal. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <FormLayout
      form={form}
      title={fee ? 'Editar Taxa Sazonal' : 'Nova Taxa Sazonal'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isEditing={!!fee}
      entityName={fee?.title}
      entityType="taxa sazonal"
      onDelete={fee && onDelete ? async () => onDelete() : undefined}
    >
      <div className="space-y-6">
        {/* Select para escolher tipo */}
        <div className="mb-4">
          <FormLabel>Tipo de Recorrência*</FormLabel>
          <select
            className="input border rounded px-2 py-1 mt-1"
            value={tipoSelecao}
            onChange={e => setTipoSelecao(e.target.value as "periodo" | "dias")}
          >
            <option value="periodo">Período</option>
            <option value="dias">Dias da Semana</option>
          </select>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da taxa sazonal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa (%)*</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       {/* Campos dinâmicos */}
        {tipoSelecao === "periodo" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDay"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Inicial</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="99/99"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      placeholder="DD/MM"
                    >
                      {(inputProps: React.ComponentProps<typeof Input>) => <Input {...inputProps} />}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDay"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Final</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="99/99"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      placeholder="DD/MM"
                    >
                      {(inputProps: React.ComponentProps<typeof Input>) => <Input {...inputProps} />}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {tipoSelecao === "dias" && (
          <div className="mb-4">
            <FormLabel>Dias da Semana</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {diasSemana.map(dia => (
                <label key={dia.value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={diasSelecionados.includes(dia.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setDiasSelecionados([...diasSelecionados, dia.value]);
                      } else {
                        setDiasSelecionados(diasSelecionados.filter(d => d !== dia.value));
                      }
                    }}
                  />
                  {dia.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormLayout>
  );
} 