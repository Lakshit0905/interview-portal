"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/navigation";
import { Icon } from "@/components/shared/icon";
import { searchAction } from "@/lib/actions/search";
import type { SearchResult } from "@/types";
import { FileText, Code2, HelpCircle, MessagesSquare, CornerDownLeft } from "lucide-react";

const TYPE_ICON = { note: FileText, coding: Code2, question: HelpCircle, behavioral: MessagesSquare };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [pending, startTransition] = React.useTransition();

  // Cmd/Ctrl+K to toggle.
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced server search.
  React.useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      startTransition(async () => setResults(await searchAction(query)));
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const go = (href: string) => { setOpen(false); setQuery(""); router.push(href); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search notes, problems, questions, stories…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{pending ? "Searching…" : "No results found."}</CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((r) => {
              const I = TYPE_ICON[r.type];
              return (
                <CommandItem key={`${r.type}-${r.id}`} value={`${r.title} ${r.snippet}`} onSelect={() => go(r.href)}>
                  <I className="text-muted-foreground" />
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">{r.meta}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {!query && NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem key={item.href} value={item.title} onSelect={() => go(item.href)}>
                  <Icon name={item.icon} className="text-muted-foreground" />
                  <span className="flex-1">{item.title}</span>
                  {item.shortcut && <kbd className="font-mono text-[0.65rem] text-muted-foreground">{item.shortcut}</kbd>}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {query && (
          <CommandGroup heading="Actions">
            <CommandItem value="full-search" onSelect={() => go(`/search?q=${encodeURIComponent(query)}`)}>
              <CornerDownLeft className="text-muted-foreground" />
              <span>See all results for “{query}”</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
