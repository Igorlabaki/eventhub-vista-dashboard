import { proposalService } from "@/services/proposal.service";
import { ProposalQuoteInput } from "@/types/proposal";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

export const useProposalQuote = (input: ProposalQuoteInput | null) => {
  const key = input ? JSON.stringify(input) : null;
  const [debouncedKey] = useDebounce(key, 400);

  const query = useQuery({
    queryKey: ["proposal-quote", debouncedKey],
    queryFn: () => proposalService.quoteProposal(JSON.parse(debouncedKey as string) as ProposalQuoteInput),
    enabled: !!debouncedKey,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    retry: false,
  });

  if (!key) return { quote: undefined, isUpdating: false, error: null };

  return {
    quote: query.data?.data,
    isUpdating: key !== debouncedKey || query.isFetching,
    error: query.isError && !query.isFetching ? query.error : null,
  };
};
