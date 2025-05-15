import { useState } from "react";
import { Input } from "@/components/ui/input";

interface FilterListProps<T> {
  items: T[];
  filterBy: (item: T, query: string) => boolean;
  placeholder?: string;
  children: (filtered: T[]) => React.ReactNode;
}

export function FilterList<T>({
  items,
  filterBy,
  placeholder = "Buscar...",
  children,
}: FilterListProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => filterBy(item, search));

  return (
    <div>
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full"
      />
      {children(filtered)}
    </div>
  );
}