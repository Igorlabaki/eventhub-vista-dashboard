import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Skeleton className="h-10 w-10 rounded-full mr-4" />
              
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-5 w-32 mb-2 sm:mb-0" />
                  <Skeleton className="h-4 w-20" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              
              <div className="ml-2">
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 