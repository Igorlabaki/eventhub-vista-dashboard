import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button } from "@/components/ui/button";
import { ItemListVenueResponse, Venue } from "@/types/venue";
import { Image } from "@/types/image";
import { Camera, Instagram, Facebook, Edit, EyeOff } from "lucide-react";
import { FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa";
import { Text } from "@/types/text";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";

interface VenuesListProps {
  venues: ItemListVenueResponse[];
  isLoading: boolean;
  onCreateClick: () => void;
  onCardClick: (venue: ItemListVenueResponse) => void;
  onSelectVenue: React.Dispatch<React.SetStateAction<ItemListVenueResponse>>;
  onEditVenue?: (venue: ItemListVenueResponse) => void;
}
export function VenuesList({
  venues,
  isLoading,
  onCreateClick,
  onCardClick,
  onSelectVenue,
  onEditVenue,
}: VenuesListProps) {
  const { currentUserOrganizationPermission } =
    useUserOrganizationPermissionStore();
  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_SITE"
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-100 rounded-xl animate-pulse"
            />
          ))
        ) : venues.length > 0 ? (
          venues.map((venue, idx) => (
            <div
              key={venue.id}
              className={`relative rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col cursor-pointer ${
                !venue.isShowOnOrganization
                  ? "opacity-60 border-2 border-eventhub-tertiary"
                  : ""
              }`}
              onClick={() => hasEditPermission() && onEditVenue && onEditVenue(venue)}
            >
              {/* Aviso de espaço inativo */}
              {!venue.isShowOnOrganization && (
                <div className="absolute top-0 left-0 right-0 bg-eventhub-primary text-white text-center py-2 px-4 z-10">
                  <div className="flex items-center justify-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Espaço Inativo - Não visível no site da organização
                    </span>
                  </div>
                </div>
              )}

              {venue.images &&
              venue.images.filter((img) => img.isShowOnOrganization == true)
                .length > 0 ? (
                <div className="relative h-56 w-full overflow-hidden">
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    showIndicators={false}
                    showArrows={false}
                    infiniteLoop
                    autoPlay
                    interval={5000}
                    className="h-56"
                  >
                    {venue.images
                      .filter((img) => img.isShowOnOrganization)
                      .map((img, idx) => (
                        <div key={idx} className="h-56 w-full">
                          <img
                            src={img.imageUrl}
                            alt={venue.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                  </Carousel>
                  <span className="absolute top-4 left-4 bg-eventhub-primary hover:bg-indigo-600 text-white  text-sm font-semibold px-4 py-1 rounded-lg shadow">
                    {venue.name}
                  </span>
                  {hasEditPermission() && (
                    <Button
                      variant="outline"
                      className=" bg-gray-200 absolute top-1 right-1 w-10 h-10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVenue(venue);
                      }}
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className="h-56 w-full bg-gray-100 flex justify-center items-center font-semibold text-gray-500 "
                  onClick={() => onSelectVenue(venue)}
                >
                  Selecione as imagens
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col relative">
                <p className="text-gray-500 mb-1 font-medium">
                  {venue.city} / {venue.state}
                </p>
                {hasEditPermission() && onEditVenue && (
                  <button
                    className="  absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVenue(venue);
                    }}
                    title="Editar informações"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {venue.name}
                  </h3>
                  <div className="flex gap-2">
                    <a
                      href={`${venue.instagramUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="w-4 h-4" />
                    </a>
                    <a
                      href={`${venue.facebookUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebook className="w-4 h-4" />
                    </a>
                    <a
                      href={`${venue.tiktokUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTiktok className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <h3 className="mt-2 mb-4 space-y-1 text-gray-500 font-semibold text-sm">
                  {venue.description}
                </h3>
                {/* Lista de amenities */}
                {venue.texts &&
                  (venue.texts as unknown as Text[]).filter(
                    (t) => t.area === "amenities"
                  ).length > 0 && (
                    <ul className="mb-4 space-y-1 list-disc list-inside">
                      {(venue.texts as unknown as Text[])
                        .filter((t) => t.area === "amenities")
                        .sort((a, b) => a.position - b.position)
                        .map((t) => (
                          <li
                            key={t.id}
                            className="text-gray-700 text-sm font-medium"
                          >
                            {t.text}
                          </li>
                        ))}
                    </ul>
                  )}
                <Button
                  asChild
                  className={
                    "bg-eventhub-primary hover:bg-indigo-600 text-white"
                  }
                  size="lg"
                >
                  <a
                    href={`${venue.url}`} // Trocar para link real do espaço se existir
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar {venue.name}
                  </a>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-gray-500 py-16">
            Nenhum espaço cadastrado
          </div>
        )}
      </div>
    </div>
  );
}
