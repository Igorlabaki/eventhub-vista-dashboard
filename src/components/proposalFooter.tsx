import React from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaGlobe,
} from "react-icons/fa";
import { Calendar } from "lucide-react";
import { venueSocialIcons } from "@/lib/venue-social-icons";

interface ProposalFooterVenue {
  name?: string | null;
  links?: { kind: string; label: string; href: string }[];
}

interface ProposalFooterProps {
  selectedVenue: ProposalFooterVenue | null;
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
          Siga nas redes sociais:
        </span>
        <div className="flex gap-8 justify-center md:justify-start">
          {venueSocialIcons(selectedVenue?.links, {
            WHATSAPP: FaWhatsapp,
            FACEBOOK: FaFacebook,
            TIKTOK: FaTiktok,
            INSTAGRAM: FaInstagram,
            SITE: FaGlobe,
          }).map((link) => (
            <a
              key={link.kind}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
            >
              <link.icon
                size={26}
                color="#fff"
                className="hover:scale-110 transition-transform"
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
