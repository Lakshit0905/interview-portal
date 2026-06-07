"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(initialQuery);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const q = value.trim();
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    }, 250);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search notes, problems, questions, stories…"
        className="h-11 pl-10 text-base"
      />
    </div>
  );
}
