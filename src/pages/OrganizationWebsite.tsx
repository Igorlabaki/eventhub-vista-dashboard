import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import AccessDenied from "@/components/accessDenied";

export default function OrganizationWebsite() {
  const { venues, fetchVenues, isLoading } = useVenueStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { id: organizationId } = useParams();
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  useEffect(() => {
    if (organizationId && user?.id) {
      fetchVenues({ organizationId, userId: user.id });
    }
  }, [fetchVenues, organizationId, user?.id]);

  const handleManageVenues = () => {
    navigate(`/organization/${organizationId}/website/venues`);
  };

  const handleManageSEO = () => {
    navigate(`/organization/${organizationId}/website/seo`);
  };

  return (
    <DashboardLayout
      title="Site da Organização"
      subtitle="Gerencie sua presença online"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview do Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-[400px] md:h-[500px] bg-gray-100 rounded-md flex flex-col items-center justify-center border relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="p-6 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">
                    Preview do seu site
                  </h3>
                  <p className="text-gray-500 mt-2 mb-4">
                    Seu site será construído automaticamente com base nos
                    textos da sua organização
                  </p>
                  <Button asChild className="mt-2" size="sm">
                    <a
                      href="https://goncalos-hub.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver site ao vivo
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Espaços da Organização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-100 rounded-md animate-pulse"
                    />
                  ))
                ) : venues.length > 0 ? (
                  venues.slice(0, 3).map((venue) => (
                    <div
                      key={venue.id}
                      className="p-4 bg-gray-50 rounded-md border"
                    >
                      <h4 className="font-medium text-sm mb-1">{venue.name}</h4>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum espaço cadastrado
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleManageVenues}
              >
                Gerenciar Espaços
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO e Visibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Status do Site</p>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <p className="text-sm text-gray-600">
                      Em desenvolvimento
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Espaços publicados</p>
                  <p className="text-2xl font-bold">{venues.length}</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleManageSEO}
                >
                  Configurações de SEO
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 