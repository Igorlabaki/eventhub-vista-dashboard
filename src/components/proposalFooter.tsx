import React from 'react'
import { Venue } from '@/types/venue';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaGlobe } from 'react-icons/fa';

interface ProposalFooterProps {
  selectedVenue: Venue | null;
}

export function ProposalFooter({ selectedVenue }: ProposalFooterProps) {
  return (
    <footer className="w-full bg-eventhub-primary flex flex-col items-center py-8 gap-y-8">
      <span className="text-white text-lg font-semibold">
        Siga a {selectedVenue?.name} nas redes sociais:
      </span>
      <div className="flex gap-8 justify-center">
        {selectedVenue?.whatsappNumber && (
          <a
            href={`https://wa.me/${selectedVenue.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
          >
            <FaWhatsapp size={26} color="#fff" className="hover:scale-110 transition-transform" />
          </a>
        )}
        {selectedVenue?.facebookUrl && (
          <a
            href={selectedVenue.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
          >
            <FaFacebook size={26} color="#fff" className="hover:scale-110 transition-transform" />
          </a>
        )}
        {selectedVenue?.tiktokUrl && (
          <a
            href={selectedVenue.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
          >
            <FaTiktok size={26} color="#fff" className="hover:scale-110 transition-transform" />
          </a>
        )}
        {selectedVenue?.instagramUrl && (
          <a
            href={selectedVenue.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <FaInstagram size={26} color="#fff" className="hover:scale-110 transition-transform" />
          </a>
        )}
        {selectedVenue?.url && (
          <a
            href={selectedVenue.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Site"
          >
            <FaGlobe size={26} color="#fff" className="hover:scale-110 transition-transform" />
          </a>
        )}
      </div>
    </footer>
  )
}
