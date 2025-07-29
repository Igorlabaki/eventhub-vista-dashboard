import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { FiUsers, FiClock } from "react-icons/fi";
import { Calendar } from "lucide-react";
import NotFound from "./NotFound";
import { ProposalFooter } from "@/components/proposalFooter";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { format, toZonedTime } from "date-fns-tz";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date | string) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  // Converter para UTC neutro
  const zoned = toZonedTime(d, "UTC");
  return format(zoned, "dd/MM/yyyy", { timeZone: "UTC" });
}

function formatHour(date: Date | string) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  // Converter para UTC neutro
  const zoned = toZonedTime(d, "UTC");
  return format(zoned, "HH:mm", { timeZone: "UTC" });
}

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const { currentProposal, isLoading, error, fetchProposalById } =
    useProposalStore();
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [venueLoading, setVenueLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProposalById(id);
    }
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (currentProposal?.venueId) {
      setVenueLoading(true);
      fetchVenueById(currentProposal.venueId).finally(() =>
        setVenueLoading(false)
      );
    }
  }, [currentProposal?.venueId, fetchVenueById]);

  if (isLoading || venueLoading) {
    return <AppLoadingScreen />;
  }
  if (error) return <NotFound />;
  if (!currentProposal) return <NotFound />;

  // Dados principais
  const {
    completeClientName,
    email,
    guestNumber,
    startDate,
    endDate,
    basePrice,
    extraHoursQty,
    extraHourPrice,
    totalAmount,
    proposalServices,
  } = currentProposal;

  const whatsapp = selectedVenue?.whatsappNumber || "";

  // Serviços adicionais
  const serviceList = proposalServices || [];

  // Horário formatado
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationHours = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  );
  console.log(selectedVenue);
  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex justify-start py-14 items-center bg-eventhub-background flex-col px-3 flex-1">
        <div className="flex items-center w-full justify-center mb-10">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          <span className="ml-2 font-bold text-3xl text-eventhub-primary">
            EventHub
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg py-10 px-5 max-w-lg w-full ">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-600">
            Proposta
          </h2>
          <div className="flex items-center justify-center gap-3 text-gray-700 mb-6">
            <span className="flex items-center gap-1 text-sm sm:text-base">
              <FiUsers /> ({guestNumber})
            </span>
            {!selectedVenue?.hasOvernightStay && (
              <span className="flex items-center gap-1 text-sm sm:text-base">
                <FiClock /> {formatHour(start)} - {formatHour(end)} (
                {durationHours}
                hrs)
              </span>
            )}
            <span className="flex items-center gap-1 text-[12px] sm:text-base ">
              <Calendar className="w-4 h-4" />
              {selectedVenue?.hasOvernightStay ? (
                <span className="flex flex-row justify-center items-center gap-x-1 leading-tight text-center">
                  <div className="flex flex-row justify-center items-center gap-x-1">
                    <p>{formatDate(start)}</p>
                    <p>({`${formatHour(start)}hrs`})</p>
                  </div>
                  <span className="mx-auto">até</span>
                  <span className="flex flex-row justify-center items-center gap-x-1 leading-tight text-center">
                    <div className="flex flex-row justify-center items-center gap-x-1">
                      <p>{formatDate(end)}</p> 
                      <p>({`${formatHour(end)}hrs`})</p>{" "}
                    </div>
                  </span>
                </span>
              ) : (
                formatDate(start)
              )}
            </span>
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Valor base:</span> <span>{formatCurrency(basePrice)}</span>
            </div>
            {extraHoursQty > 0 && (
              <div className="flex justify-between">
                <span>Horas extras ({extraHoursQty}hrs):</span>{" "}
                <span>{formatCurrency(extraHourPrice * extraHoursQty)}</span>
              </div>
            )}
            {serviceList.map((s) => (
              <div className="flex justify-between" key={s.id}>
                <span>{s.service?.name || "Serviço"}</span>
                <span>{formatCurrency(Number(s.service?.price || 0))}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-8 mb-2">
            <span className="text-lg font-semibold text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-gray-600">
              {formatCurrency(totalAmount)} *
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-6">
            * Valor sujeito a alteração.
          </div>
          <div className="text-center text-gray-700 mb-2 text-sm sm:text-base">
            Tem alguma dúvida ou gostaria de conversar com a gente?
          </div>
          <div className="text-center mb-4">
            <a
              href={`https://wa.me/${whatsapp.replace(
                /\D/g,
                ""
              )}?text=${encodeURIComponent(
                `Olá, gostaria de saber mais sobre a ${selectedVenue?.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 font-semibold hover:underline flex items-center justify-center gap-1 animate-bounce"
            >
              Falar no WhatsApp{" "}
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.73 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" />
              </svg>
            </a>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            * Este orçamento foi encaminhado para o seu email: <b>{email}</b>
          </div>
        </div>
      </main>
      <ProposalFooter selectedVenue={selectedVenue} />
    </div>
  );
}
