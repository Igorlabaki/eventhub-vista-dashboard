import { Organization, OrganizationWithVenueCount } from '@/types/organization';
import { OrganizationCard } from './OrganizationCard';
import { OrganizationCardSkeleton } from './OrganizationCardSkeleton';

interface OrganizationListProps {
  organizations: OrganizationWithVenueCount[];
  isLoading?: boolean;
}

export function OrganizationList({ organizations, isLoading }: OrganizationListProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <OrganizationCardSkeleton key={i} />
          ))
        : organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              id={org.id}
              name={org.name}
              venueCount={org._count.venues}
              newBudgetsCount={0}
            />
          ))}
    </div>
  );
} 