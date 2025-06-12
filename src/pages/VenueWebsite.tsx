import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useVenueStore } from "@/store/venueStore";
import { useImageStore } from "@/store/imageStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VenueWebsite() {
  const { selectedVenue } = useVenueStore();
  const { images, fetchImages, isLoading: isLoadingImages } = useImageStore();
  const { analytics, fetchAnalytics, isLoading: isLoadingAnalytics } = useAnalyticsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedVenue?.id) {
      fetchImages({ venueId: selectedVenue.id });
      
      // Adiciona data de início e fim para o último mês
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      fetchAnalytics({ 
        venueId: selectedVenue.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }).then(() => {
     
      }).catch(error => {
    
      });
    }
  }, [selectedVenue?.id, fetchImages, fetchAnalytics]);

  const handleManageImages = () => {
    navigate(`/venue/${selectedVenue?.id}/website/images`);
  };

  const handleManageSEO = () => {
    navigate(`/venue/${selectedVenue?.id}/website/seo`);
  };

  return (
    <DashboardLayout
      title="Site do Espaço"
      subtitle="Gerencie sua presença online"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview do Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-[400px] md:h-[500px]  bg-gray-100 rounded-md flex flex-col items-center justify-center border relative overflow-hidden"
            >
              {selectedVenue?.url && (
                <img
                  src={`https://image.thum.io/get/width/800/crop/600/${selectedVenue.url}`}
                  alt="Preview do site"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ zIndex: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="p-6 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">
                    Preview do seu site
                  </h3>
                  <p className="text-gray-500 mt-2 mb-4">
                    Seu site será construído automaticamente com base nas
                    informações do seu espaço
                  </p>
                  <Button asChild className="mt-2" size="sm">
                    <a
                      href={selectedVenue?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver site ao vivo
                    </a>
                  </Button>
                  {!selectedVenue?.url && (
                    <p className="text-gray-400 mt-2">Cadastre uma URL para ver o preview</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de Imagens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {isLoadingImages ? (
                  // Placeholder durante o carregamento
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border animate-pulse"
                    >
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  ))
                ) : images.length > 0 ? (
                  // Exibe as imagens reais
                  images.slice(0, 4).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-gray-100 rounded-md overflow-hidden border relative group"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.description || "Imagem do espaço"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm text-center p-2">
                          {image.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Mensagem quando não há imagens
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    Nenhuma imagem cadastrada
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleManageImages}
              >
                Gerenciar Imagens
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
                    <div className={`h-3 w-3 rounded-full ${analytics?.indexedPages ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                    <p className="text-sm text-gray-600">
                      {analytics?.indexedPages ? 'Online e indexado' : 'Aguardando indexação'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Visitas este mês</p>
                  {isLoadingAnalytics ? (
                    <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">{analytics?.monthlyVisits || 0}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Pontuação SEO</p>
                  {isLoadingAnalytics ? (
                    <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${analytics?.seoScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{analytics?.seoScore || 0}%</span>
                    </div>
                  )}
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
