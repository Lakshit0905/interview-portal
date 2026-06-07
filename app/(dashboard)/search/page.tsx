import Link from "next/link";
import { globalSearch } from "@/lib/data/search";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/components/shared/icon";
import type { SearchResult } from "@/types";

const TYPE_META: Record<SearchResult["type"], { label: string; icon: string }> = {
  note: { label: "Notes", icon: "Library" },
  coding: { label: "Coding Problems", icon: "Code2" },
  question: { label: "Questions", icon: "HelpCircle" },
  behavioral: { label: "Behavioral Stories", icon: "MessagesSquare" },
};
const ORDER: SearchResult["type"][] = ["note", "coding", "question", "behavioral"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await globalSearch(q) : [];
  const grouped = ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Search" description="One query across your entire knowledge base — notes, coding problems, questions and stories." />
      <SearchInput initialQuery={q} />

      <div className="mt-7">
        {!q.trim() ? (
          <EmptyState icon="Search" title="Start typing" description="Results update as you type. Try “flaky”, “window function”, or “contract testing”." />
        ) : results.length === 0 ? (
          <EmptyState icon="SearchX" title="No matches" description={`Nothing found for “${q}”. Try a broader term.`} />
        ) : (
          <div className="space-y-7">
            <p className="mono-label">{results.length} result{results.length === 1 ? "" : "s"}</p>
            {grouped.map((g) => (
              <section key={g.type}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon name={TYPE_META[g.type].icon} className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{TYPE_META[g.type].label}</h2>
                  <span className="font-mono text-xs text-muted-foreground/60">{g.items.length}</span>
                </div>
                <div className="space-y-2">
                  {g.items.map((r) => (
                    <Link key={`${r.type}-${r.id}`} href={r.href} className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{r.title}</p>
                        {r.meta && <span className="shrink-0 font-mono text-[0.65rem] text-muted-foreground">{r.meta}</span>}
                      </div>
                      {r.snippet && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.snippet}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
