import { Clock } from "lucide-react";
import { Calendar } from "lucide-react";
import { useProposalStore } from "@/store/proposalStore";
import { Users } from "lucide-react";
import React from "react";
import { useVenueStore } from '@/store/venueStore';

interface ProposalService {
  service?: {
    name?: string;
    price?: number;
  };
}


export function ProposalServicesSummary() {
    const { currentProposal } = useProposalStore()
    const { selectedVenue } = useVenueStore();
  const servicosAdicionais = currentProposal?.proposalServices.map((ps) => ({
    name: ps.service?.name,
    price: ps.service?.price || 0,
  }));

  return (
    <div className="rounded-xl p-6 mb-6 bg-white shadow-md w-full max-w-2xl mx-auto">
         <h1 className="text-2xl font-bold text-center text-primary mb-10">Informações do Evento</h1>
      <div className="flex sm:flex-row justify-center md:gap-6 mb-6 px-4">
        <div className="flex flex-col items-center gap-2  rounded-lg px-4 pb-2">
          <Users className="text-primary" size={18} />
          <span className="font-semibold text-primary text-sm md:text-base">
            {currentProposal?.guestNumber}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2  rounded-lg px-4 pb-2">
          <Calendar className="text-primary" size={18} />
          <span className="font-semibold text-center text-primary text-[13px] md:text-base">
            {selectedVenue?.hasOvernightStay
              ? currentProposal?.startDate && currentProposal?.endDate
                ? `${new Date(currentProposal.startDate).toLocaleDateString("pt-BR")} até ${new Date(currentProposal.endDate).toLocaleDateString("pt-BR")}`
                : "-"
              : currentProposal?.startDate
                ? new Date(currentProposal.startDate).toLocaleDateString("pt-BR")
                : "-"
            }
          </span>
        </div>
        <div className="flex flex-col items-center text-primary gap-2  rounded-lg px-4 pb-2">
          <Clock className="" size={18} />
          <span className="font-semibold text-sm md:text-base flex">
            <p>{`${new Date(currentProposal?.startDate).toISOString().substring(11, 16)}`}</p>
            <p>{` - `}</p>
            <p>{`${new Date(currentProposal?.endDate).toISOString().substring(11, 16)}`}</p>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between  text-gray-600">
          <span>Valor Base</span>
          <span className="font-medium">
            {currentProposal?.basePrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        {currentProposal?.extraHourPrice > 0 && currentProposal?.extraHoursQty > 0 && (
          <div className="flex justify-between  text-gray-600">
            <span>Hora Extra</span>
            <span className="font-medium">
              {(currentProposal.extraHourPrice * currentProposal.extraHoursQty).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        )}
        {servicosAdicionais.map((serv, idx) => (
          <div
            className="flex justify-between  text-gray-600"
            key={idx}
          >
            <span>{serv.name}</span>
            <span className="font-medium">
              {serv.price?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        ))}
        <div className="flex justify-between mt-4 text-lg ">
          <span className="font-bold text-gray-600">Total:</span>
          <span className="font-bold text-gray-600">
            {currentProposal?.totalAmount.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6 text-sm text-gray-600 mt-4">
          <div>
            * Valor por pessoa:{" "}
            <span className="font-semibold">
              {currentProposal?.guestNumber && currentProposal?.basePrice
                ? (currentProposal?.basePrice / currentProposal?.guestNumber).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "-"}
            </span>
          </div>
          <div>
            * Valor da hora extra:{" "}
            <span className="font-semibold">
              {currentProposal?.extraHourPrice?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <div>
            * Qtde horas extra:{" "}
            <span className="font-semibold">{currentProposal?.extraHoursQty || 0}</span>
          </div>
        </div>
      </div>
      <div className="mb-6 max-w-2xl mx-auto">
        <span className="block text-sm text-gray-500 font-medium mb-1">
          Descrição:
        </span>
        <div className="bg-gray-100 rounded px-3 py-2 min-h-[32px] text-gray-700 text-base">
          {currentProposal?.description || "-"}
        </div>
      </div>
    </div>
  );
}
