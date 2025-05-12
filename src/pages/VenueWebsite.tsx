
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function VenueWebsite() {
  return (
    <DashboardLayout title="Site do Espaço" subtitle="Gerencie sua presença online">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview do Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-md flex flex-col items-center justify-center border">
              <div className="p-6 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Preview do seu site</h3>
                <p className="text-gray-500 mt-2 mb-4">
                  Seu site será construído automaticamente com base nas informações do seu espaço
                </p>
                <Button className="mt-2" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver site ao vivo
                </Button>
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
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
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
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm text-gray-600">Online e indexado</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Visitas este mês</p>
                  <p className="text-2xl font-bold">243</p>
                </div>

                <Button variant="outline" className="w-full mt-2">
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
