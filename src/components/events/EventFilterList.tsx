import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Proposal } from "@/types/proposal";

interface EventFilterListProps {
  items: Proposal[];
  filterBy: (item: Proposal, query: string) => boolean;
  placeholder?: string;
  children: (filteredItems: Proposal[]) => React.ReactNode;
}

export function EventFilterList({
  items,
  filterBy,
  placeholder = "Buscar...",
  children,
}: EventFilterListProps) {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const filtered = items.filter((item) => filterBy(item, query));
    setFilteredItems(filtered);
  }, [items, query, filterBy]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {children(filteredItems)}
    </div>
  );
} 