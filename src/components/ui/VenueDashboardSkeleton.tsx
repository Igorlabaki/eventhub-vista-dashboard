import { Skeleton } from "@/components/ui/skeleton";

export default function VenueDashboardSkeleton() {
  return (
    <div>
      {/* Título e subtítulo */}
      <div className="mb-6">
        <div className="h-8 w-48 mb-2"><Skeleton className="h-8 w-48" /></div>
        <div className="h-5 w-80"><Skeleton className="h-5 w-80" /></div>
      </div>
      {/* Filtros de mês e ano */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg border bg-white dark:bg-zinc-900">
            <Skeleton className="h-5 w-24 mb-2" /> {/* Título */}
            <Skeleton className="h-8 w-32 mb-2" /> {/* Valor */}
            <Skeleton className="h-5 w-16" /> {/* Subtítulo ou trend */}
          </div>
        ))}
      </div>
    </div>
  );
} 