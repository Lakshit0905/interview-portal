import { notFound } from "next/navigation";
import { getSubject, getAllSlugs } from "@/lib/data/knowledge-hub";
import { getNote, getNotesByCategory } from "@/lib/data/knowledge";
import { Mdx } from "@/components/shared/mdx";
import { TopicPageClient } from "@/components/knowledge/topic-page-client";
import { Badge } from "@/components/ui/badge";
import { ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Clock, CalendarDays } from "lucide-react";

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];

  for (const subjectSlug of getAllSlugs()) {
    const subject = getSubject(subjectSlug)!;
    // Generate for all topics in the subject
    for (const topic of subject.topics) {
      params.push({ category: subjectSlug, slug: topic.slug });
    }
    // Also generate for any existing MDX notes (may not match topic slugs 1:1)
    const mdxSlug = subject.mdxSlug ?? subjectSlug;
    const notes = await getNotesByCategory(mdxSlug).catch(() => []);
    for (const n of notes) {
      params.push({ category: subjectSlug, slug: n.slug });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return params.filter(({ category, slug }) => {
    const key = `${category}/${slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function TopicOrNotePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const subject = getSubject(category);
  if (!subject) notFound();

  const topic = subject.topics.find((t) => t.slug === slug);
  const mdxSlug = subject.mdxSlug ?? subject.slug;

  // Try to find an MDX note matching this slug
  const note = await getNote(mdxSlug, slug).catch(() => null);

  if (!topic && !note) notFound();

  // If there's an MDX note but no matching topic, render the full rich article view
  if (!topic && note) {
    const a = ACCENT_CLASS[subject.accent] ?? ACCENT_CLASS.slate;
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/knowledge/${category}`}
          className="mono-label mb-5 inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> {subject.title.toLowerCase()}
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

  // Render topic page (with MDX note embedded if one exists for this topic slug)
  const mdxComponent = note ? <Mdx source={note.content} /> : null;

  return (
    <TopicPageClient
      subject={subject}
      topic={topic!}
      mdxNote={note ? { slug: note.slug, title: note.title, component: mdxComponent } : null}
    />
  );
}
