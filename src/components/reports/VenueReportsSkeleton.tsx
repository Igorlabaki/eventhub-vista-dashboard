import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VenueReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header com controles de ano e botão de exportar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Cards de métricas */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>

        {/* Lista de fontes */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-4 w-20 mx-auto mb-2" />
                  <Skeleton className="h-8 w-24 mx-auto" />
                </div>
              ))}
            </div>

            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 flex-1 mx-2" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 flex-1 mx-2" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 