import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EntityQuery {
  name: string;
  value: string;
}

interface SearchFilterListByQueriesProps {
  queryName: string;
  entityQueries: EntityQuery[];
  fetchData: (queryString: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchFilterListByQueries({
  queryName,
  entityQueries,
  fetchData,
  placeholder = "Filtrar...",
  debounceMs = 500,
}: SearchFilterListByQueriesProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, debounceMs);

  useEffect(() => {
    const params = new URLSearchParams();
    entityQueries.forEach((item) => {
      params.set(item.name, item.value);
    });
    params.set(queryName, debouncedQuery);
    fetchData(params.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, JSON.stringify(entityQueries)]);

  return (
    <div className="flex items-center gap-2 bg-white rounded-md px-3 py-2 shadow-sm mb-4">
      <Search className="h-4 w-4 text-gray-400" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-none shadow-none focus:ring-0"
      />
    </div>
  );
}