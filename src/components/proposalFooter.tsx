import React from "react";
import { Venue } from "@/types/venue";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaGlobe,
} from "react-icons/fa";
import { Calendar } from "lucide-react";

interface ProposalFooterProps {
  selectedVenue: Venue | null;
}

export function ProposalFooter({ selectedVenue }: ProposalFooterProps) {
  return (
    <footer className="w-full bg-[#4f46e5] flex flex-col md:flex-row items-center md:items-start justify-between  py-8 px-6 gap-y-8 md:gap-y-0 md:gap-x-8">
      <div>
        {/* Logo EventHub - canto direito no desktop, acima das redes sociais no mobile */}
        <div className="flex flex-col items-center justify-center md:flex-1  md:mt-0 ">
          {/* SVG do logo EventHub versão branca */}
          <div className="flex justify-center items-center gap-2 mb-2">
            {/* Ícone Calendar estilizado em branco */}
            <Calendar className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">EventHub</h1>
          </div>
          <p className="text-white text-center text-base">
            Seu hub para gestão de eventos
          </p>
        </div>
      </div>
      {/* Redes sociais - canto esquerdo no desktop, abaixo do logo no mobile */}
      <div className="flex flex-col items-center md:items-start">
        <span className="text-white text-lg font-semibold mb-4 md:mb-6">
          Siga a {selectedVenue?.name} nas redes sociais:
        </span>
        <div className="flex gap-8 justify-center md:justify-start">
          {selectedVenue?.whatsappNumber && (
            <a
              href={`https://wa.me/${selectedVenue.whatsappNumber.replace(
                /\D/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
            >
              <FaWhatsapp
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          )}
          {selectedVenue?.facebookUrl && (
            <a
              href={selectedVenue.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <FaFacebook
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          )}
          {selectedVenue?.tiktokUrl && (
            <a
              href={selectedVenue.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
            >
              <FaTiktok
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          )}
          {selectedVenue?.instagramUrl && (
            <a
              href={selectedVenue.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <FaInstagram
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          )}
          {selectedVenue?.url && (
            <a
              href={selectedVenue.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Site"
            >
              <FaGlobe
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
