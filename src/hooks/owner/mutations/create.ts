import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { ownerService } from '@/services/owner.service';
import { CreateOwnerDTO } from '@/types/owner';

export const useCreateVenueOwnerMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const createVenueOwner = useMutationWithError<unknown, CreateOwnerDTO>(
    ownerService.createVenueOwner,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['venue-owners', userId] });
      }
    }
  );

  return { createVenueOwner };
};

export const useCreateOrganizationOwnerMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const createOrganizationOwner = useMutationWithError<unknown, CreateOwnerDTO>(
    ownerService.createOrganizationOwner,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organization-owners', userId] });
      }
    }
  );

  return { createOrganizationOwner };
};