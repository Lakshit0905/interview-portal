import { KnowledgeHubClient } from "@/components/knowledge/knowledge-hub-client";
import { PageHeader } from "@/components/shared/page-header";
import { HUB_SUBJECTS } from "@/lib/data/knowledge-hub";
import { getNotesByCategory } from "@/lib/data/knowledge";
import { db } from "@/lib/data/db";
import type { SubjectStats } from "@/components/knowledge/subject-card";
import { Brain } from "lucide-react";

async function buildStatsMap(): Promise<Record<string, SubjectStats>> {
  const [allFlashcards, allQuestions] = await Promise.all([
    db.flashcards.list(),
    db.questions.list(),
  ]);

  const statsMap: Record<string, SubjectStats> = {};

  for (const subject of HUB_SUBJECTS) {
    const flashcards = subject.flashcardTopic
      ? allFlashcards.filter((f) => f.topic === subject.flashcardTopic).length
      : 0;

    const questions = subject.questionCategory
      ? allQuestions.filter((q) => q.category === subject.questionCategory).length
      : 0;

    let notes = 0;
    if (subject.mdxSlug) {
      const mdxNotes = await getNotesByCategory(subject.mdxSlug).catch(() => []);
      notes = mdxNotes.length;
    }

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

    statsMap[subject.slug] = {
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
  }

  return statsMap;
}

export default async function KnowledgeHubPage() {
  const statsMap = await buildStatsMap();

  return (
    <div>
      <PageHeader
        title="Knowledge Hub"
        description="Your complete SDET interview OS — 30 subjects, structured topics, spaced-repetition flashcards, and interview Q&As in one place."
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
          <Brain className="h-5 w-5 text-primary" />
        </div>
      </PageHeader>
      <KnowledgeHubClient statsMap={statsMap} />
    </div>
  );
}
