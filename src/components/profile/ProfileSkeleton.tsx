import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Header } from "../Header";
import { SidebarNav } from "../SidebarNav";

export function ProfileSkeleton() {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarNav />
        <div className="flex flex-col flex-1 min-h-0">
          <Header title="Meu Perfil" subtitle="Gerencie suas informações pessoais" />
          <div className="flex-1 p-8 overflow-auto">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-8 w-48 mb-2" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-64" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-8">
                    <Skeleton className="h-32 w-32 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Skeleton className="h-10 w-24 rounded-md" />
                      <Skeleton className="h-10 w-32 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-8 w-48 mb-2" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-64" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }