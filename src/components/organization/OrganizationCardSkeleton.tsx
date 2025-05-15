export function OrganizationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-6 shadow">
      <div className="h-6 w-2/3 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
    </div>
  );
} 