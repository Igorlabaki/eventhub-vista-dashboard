import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { wallClockDateIso, wallClockTime } from "@/lib/wall-clock-datetime";
import {
  proposalService,
  RecalculatePublicProposalData,
} from "@/services/proposal.service";

const CONFIRMED_MESSAGE = "Este orçamento já foi confirmado e não pode ser recalculado.";
const MULTI_DAY_MESSAGE = "Este orçamento tem mais de um dia. Para mudar o período, fale com a equipe.";
const SAME_DAY_HOURS_MESSAGE = "A quantidade de horas precisa terminar no mesmo dia.";
const FALLBACK_MESSAGE = "Não foi possível recalcular. Tente de novo.";

type FormValues = {
  date: string;
  guestNumber: string;
  hours: string;
};

type RecalculateProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  startDate: string | Date;
  endDate: string | Date;
  guestNumber: number;
  approved: boolean;
  paid: boolean;
  maxGuest?: number | null;
  onSaved: (data: RecalculatePublicProposalData) => void;
};

function buildSchema(maxGuest?: number | null) {
  return z.object({
    date: z.string().trim().min(1, "Informe o dia do evento.").regex(/^\d{4}-\d{2}-\d{2}$/, "Informe o dia do evento."),
    guestNumber: z.string().trim().min(1, "Informe o número de convidados."),
    hours: z.string().trim().min(1, "Informe a quantidade de horas."),
  }).superRefine((value, ctx) => {
    if (value.guestNumber) {
      const guests = Number(value.guestNumber);
      if (!Number.isInteger(guests) || guests < 1) {
        ctx.addIssue({ code: "custom", path: ["guestNumber"], message: "Informe o número de convidados." });
      } else if (maxGuest && guests > maxGuest) {
        ctx.addIssue({
          code: "custom",
          path: ["guestNumber"],
          message: `A capacidade do espaço é de até ${maxGuest} pessoas.`,
        });
      }
    }

    if (value.hours) {
      const hours = Number(value.hours);
      if (!Number.isInteger(hours) || hours < 1 || hours > 24) {
        ctx.addIssue({
          code: "custom",
          path: ["hours"],
          message: "A quantidade de horas precisa ser entre 1 e 24.",
        });
      }
    }
  });
}

function durationHours(startDate: string | Date, endDate: string | Date) {
  const hours = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60),
  );
  return Number.isFinite(hours) ? String(hours) : "";
}

function messageFrom(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return FALLBACK_MESSAGE;
}

export function RecalculateProposalDialog({
  open,
  onOpenChange,
  proposalId,
  startDate,
  endDate,
  guestNumber,
  approved,
  paid,
  maxGuest,
  onSaved,
}: RecalculateProposalDialogProps) {
  const schema = useMemo(() => buildSchema(maxGuest), [maxGuest]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      date: wallClockDateIso(startDate),
      guestNumber: String(guestNumber),
      hours: durationHours(startDate, endDate),
    },
  });
  const wasOpen = useRef(false);
  const blocked = approved || paid
    ? CONFIRMED_MESSAGE
    : wallClockDateIso(startDate) !== wallClockDateIso(endDate)
      ? MULTI_DAY_MESSAGE
      : null;

  useEffect(() => {
    if (open && !wasOpen.current) {
      form.clearErrors();
      form.setValue("date", wallClockDateIso(startDate));
      form.setValue("guestNumber", String(guestNumber));
      form.setValue("hours", durationHours(startDate, endDate));
    }
    wasOpen.current = open;
  }, [open, startDate, endDate, guestNumber, form]);

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    if (blocked) return;

    const [hourText, minuteText] = wallClockTime(startDate).split(":");
    const endHour = Number(hourText) + Number(values.hours);
    if (!Number.isInteger(Number(hourText)) || !Number.isInteger(Number(minuteText)) || endHour > 23) {
      form.setError("hours", { message: SAME_DAY_HOURS_MESSAGE });
      return;
    }

    try {
      const response = await proposalService.recalculatePublicProposal(proposalId, {
        date: values.date,
        guestNumber: Number(values.guestNumber),
        hours: Number(values.hours),
      });
      onSaved(response.data);
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: messageFrom(error) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground" aria-describedby="recalculate-proposal-description">
        <DialogTitle>Alterar orçamento</DialogTitle>
        <DialogDescription id="recalculate-proposal-description">
          Mude o dia, os convidados ou as horas. O valor é recalculado ao confirmar.
        </DialogDescription>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {blocked && (
            <p role="alert" className="text-sm text-red-600">{blocked}</p>
          )}
          {errors.root?.message && (
            <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>
          )}
          <div className="space-y-1">
            <label htmlFor="recalculate-date" className="text-sm font-medium">Dia do evento</label>
            <Input
              id="recalculate-date"
              type="date"
              disabled={Boolean(blocked) || isSubmitting}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "recalculate-date-error" : undefined}
              {...form.register("date")}
            />
            {errors.date && <p id="recalculate-date-error" className="text-sm text-red-600">{errors.date.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="recalculate-guests" className="text-sm font-medium">Convidados</label>
            <Input
              id="recalculate-guests"
              type="number"
              inputMode="numeric"
              min={1}
              disabled={Boolean(blocked) || isSubmitting}
              aria-invalid={Boolean(errors.guestNumber)}
              aria-describedby={errors.guestNumber ? "recalculate-guests-error" : undefined}
              {...form.register("guestNumber")}
            />
            {errors.guestNumber && (
              <p id="recalculate-guests-error" className="text-sm text-red-600">{errors.guestNumber.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="recalculate-hours" className="text-sm font-medium">Horas do evento</label>
            <Input
              id="recalculate-hours"
              type="number"
              inputMode="numeric"
              min={1}
              max={24}
              disabled={Boolean(blocked) || isSubmitting}
              aria-invalid={Boolean(errors.hours)}
              aria-describedby={errors.hours ? "recalculate-hours-error" : undefined}
              {...form.register("hours")}
            />
            {errors.hours && <p id="recalculate-hours-error" className="text-sm text-red-600">{errors.hours.message}</p>}
          </div>
          <button
            type="submit"
            disabled={Boolean(blocked) || isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Recalculando..." : "Recalcular"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
