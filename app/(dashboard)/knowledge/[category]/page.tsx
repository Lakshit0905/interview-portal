import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE_CATEGORIES, ACCENT_CLASS } from "@/lib/constants";
import { getNotesByCategory } from "@/lib/data/knowledge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/components/shared/icon";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";

export function generateStaticParams() {
  return KNOWLEDGE_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function KnowledgeCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = KNOWLEDGE_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const notes = await getNotesByCategory(category);
  const a = ACCENT_CLASS[cat.accent];

  // Group notes by their declared section (fall back to "General").
  const bySection = new Map<string, typeof notes>();
  for (const sec of cat.sections) bySection.set(sec, []);
  for (const n of notes) {
    const key = n.section && bySection.has(n.section) ? n.section : (n.section ?? "General");
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key)!.push(n);
  }

  return (
    <div>
      <Link href="/knowledge" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> knowledge base
      </Link>
      <PageHeader title={cat.title} description={cat.description}>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", a.bg, a.ring)}>
          <Icon name={cat.icon} className={cn("h-5 w-5", a.text)} />
        </div>
      </PageHeader>

      {notes.length === 0 ? (
        <EmptyState
          icon={cat.icon}
          title="No notes here yet"
          description={`Add MDX files under content/${cat.slug}/ with frontmatter (title, description, section) and they'll appear here automatically.`}
        />
      ) : (
        <div className="space-y-8">
          {[...bySection.entries()]
            .filter(([, items]) => items.length > 0)
            .map(([section, items]) => (
              <section key={section}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
                  <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{section}</h2>
                  <span className="font-mono text-xs text-muted-foreground/60">{items.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((n) => (
                    <Link
                      key={n.slug}
                      href={`/knowledge/${cat.slug}/${n.slug}`}
                      className="card-glow group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                    >
                      <h3 className="font-semibold group-hover:text-primary">{n.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {n.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="muted">{t}</Badge>
                          ))}
                        </div>
                        <span className="flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {n.readingTime}m
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground/60">
                        updated {formatDate(n.updatedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
