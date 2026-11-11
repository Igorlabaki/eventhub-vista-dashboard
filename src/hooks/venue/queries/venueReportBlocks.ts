import { venueService } from '@/services/venue.service';
import { ReportEventCategoryFilter } from '@/types/venue';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000;

const blockQuery = { placeholderData: keepPreviousData, staleTime: STALE_TIME, retry: 1 } as const;

export const useReportOccupancy = (venueId: string | undefined, year: number, month?: number) =>
  useQuery({
    queryKey: ['venueReportBlock', 'occupancy', venueId, year, month ?? null],
    queryFn: () => venueService.getReportOccupancy({ venueId: venueId!, year, month }),
    select: (response) => response.data,
    enabled: !!venueId,
    ...blockQuery,
  });

export const useReportLeadTime = (venueId: string | undefined, year: number, eventCategory?: ReportEventCategoryFilter) =>
  useQuery({
    queryKey: ['venueReportBlock', 'lead-time', venueId, year, eventCategory ?? null],
    queryFn: () => venueService.getReportLeadTime({ venueId: venueId!, year, eventCategory }),
    select: (response) => response.data,
    enabled: !!venueId,
    ...blockQuery,
  });

export const useReportServiceAdherence = (
  venueId: string | undefined,
  year: number,
  eventCategory?: ReportEventCategoryFilter,
) =>
  useQuery({
    queryKey: ['venueReportBlock', 'service-adherence', venueId, year, eventCategory ?? null],
    queryFn: () => venueService.getReportServiceAdherence({ venueId: venueId!, year, eventCategory }),
    select: (response) => response.data,
    enabled: !!venueId,
    ...blockQuery,
  });

export const useReportEventProfile = (venueId: string | undefined, year: number) =>
  useQuery({
    queryKey: ['venueReportBlock', 'event-profile', venueId, year],
    queryFn: () => venueService.getReportEventProfile({ venueId: venueId!, year }),
    select: (response) => response.data,
    enabled: !!venueId,
    ...blockQuery,
  });
