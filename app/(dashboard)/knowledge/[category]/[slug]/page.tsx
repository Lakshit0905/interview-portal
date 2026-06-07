import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE_CATEGORIES, ACCENT_CLASS } from "@/lib/constants";
import { getNote, getNotesByCategory } from "@/lib/data/knowledge";
import { Mdx } from "@/components/shared/mdx";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, CalendarDays } from "lucide-react";

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  for (const cat of KNOWLEDGE_CATEGORIES) {
    const notes = await getNotesByCategory(cat.slug);
    for (const n of notes) params.push({ category: cat.slug, slug: n.slug });
  }
  return params;
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const cat = KNOWLEDGE_CATEGORIES.find((c) => c.slug === category);
  const note = await getNote(category, slug);
  if (!cat || !note) notFound();

  const a = ACCENT_CLASS[cat.accent];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/knowledge/${cat.slug}`}
        className="mono-label mb-5 inline-flex items-center gap-1.5 hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {cat.title.toLowerCase()}
      </Link>

      <header className="mb-8 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {note.section && (
            <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs ring-1", a.bg, a.text, a.ring)}>
              {note.section}
            </span>
          )}
          {note.tags.map((t) => (
            <Badge key={t} variant="muted">{t}</Badge>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance">{note.title}</h1>
        {note.description && <p className="mt-2 text-muted-foreground">{note.description}</p>}
        <div className="mt-4 flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {note.readingTime} min read</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(note.updatedAt)}</span>
        </div>
      </header>

      <Mdx source={note.content} />
    </div>
  );
}
