import { notFound } from "next/navigation";
import { getSubject, getAllSlugs } from "@/lib/data/knowledge-hub";
import { getNotesByCategory } from "@/lib/data/knowledge";
import { db } from "@/lib/data/db";
import { SubjectHubClient } from "@/components/knowledge/subject-hub-client";
import type { SubjectStats } from "@/components/knowledge/subject-card";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ category: slug }));
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const subject = getSubject(category);
  if (!subject) notFound();

  const [allFlashcards, allQuestions] = await Promise.all([
    db.flashcards.list(),
    db.questions.list(),
  ]);

  const mdxSlug = subject.mdxSlug ?? subject.slug;
  const rawNotes = await getNotesByCategory(mdxSlug).catch(() => []);

  const flashcards = subject.flashcardTopic
    ? allFlashcards.filter((f) => f.topic === subject.flashcardTopic).length
    : 0;

  const questions = subject.questionCategory
    ? allQuestions.filter((q) => q.category === subject.questionCategory).length
    : 0;

  const notes = rawNotes.length;
  const topicCount = subject.topics.length;

  const noteRatio  = notes > 0 ? Math.min(notes / topicCount, 1) * 60 : 0;
  const cardRatio  = flashcards > 0 ? Math.min(flashcards / 20, 1) * 30 : 0;
  const qRatio     = questions > 0 ? Math.min(questions / 5, 1) * 10 : 0;
  const completion = Math.round(noteRatio + cardRatio + qRatio);

  const subjectCards = subject.flashcardTopic
    ? allFlashcards.filter((f) => f.topic === subject.flashcardTopic)
    : [];
  const hasActivity  = subjectCards.some((c) => c.reviewCount > 0);
  const hasWeakCards = subjectCards.some((c) => c.streak === 0 && c.reviewCount > 2);

  const revisionStatus: SubjectStats["revisionStatus"] =
    !hasActivity && notes === 0 ? "new" :
    hasWeakCards ? "due" : "ok";

  const latestReview = subjectCards
    .filter((c) => c.lastReviewedAt)
    .sort((a, b) => new Date(b.lastReviewedAt!).getTime() - new Date(a.lastReviewedAt!).getTime())[0];

  const stats: SubjectStats = {
    notes,
    flashcards,
    questions,
    topics: topicCount,
    completion,
    revisionStatus,
    lastRevised: latestReview?.lastReviewedAt
      ? new Date(latestReview.lastReviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : undefined,
    hasWeakAreas: hasWeakCards,
  };

  // Map topic slugs to MDX note counts (best-effort match on slug)
  const noteCountMap: Record<string, number> = {};
  for (const note of rawNotes) {
    const matched = subject.topics.find(
      (t) => t.slug === note.slug || note.slug.includes(t.slug),
    );
    if (matched) {
      noteCountMap[matched.slug] = (noteCountMap[matched.slug] ?? 0) + 1;
    }
  }

  const mdxNotesFormatted = rawNotes.map((n) => ({
    slug: n.slug,
    title: n.title,
    description: n.description,
    section: n.section ?? "General",
    readingTime: n.readingTime,
  }));

  return (
    <SubjectHubClient
      subject={subject}
      stats={stats}
      noteCountMap={noteCountMap}
      mdxNotes={mdxNotesFormatted}
    />
  );
}
