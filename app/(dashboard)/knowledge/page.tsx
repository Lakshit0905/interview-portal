import Link from "next/link";
import { KNOWLEDGE_CATEGORIES, ACCENT_CLASS } from "@/lib/constants";
import { getAllNotes } from "@/lib/data/knowledge";
import { PageHeader } from "@/components/shared/page-header";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export default async function KnowledgePage() {
  const notes = await getAllNotes();
  const countFor = (slug: string) => notes.filter((n) => n.category === slug).length;

  return (
    <div>
      <PageHeader title="Knowledge Base" description="Your structured notes across every interview domain. Content lives as MDX under /content and renders here." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const a = ACCENT_CLASS[cat.accent];
          return (
            <Link key={cat.slug} href={`/knowledge/${cat.slug}`}
              className="card-glow group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", a.bg, a.ring)}>
                  <Icon name={cat.icon} className={cn("h-5 w-5", a.text)} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-4 font-semibold">{cat.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.sections.slice(0, 4).map((sec) => (
                  <span key={sec} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground">{sec}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="mono-label">{cat.sections.length} sections</span>
                <span className="font-mono text-xs text-muted-foreground">{countFor(cat.slug)} notes</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
