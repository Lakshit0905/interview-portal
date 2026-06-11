import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { TakeQuiz } from "@/components/quizzes/take-quiz";

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await db.quizzes.get(id);
  if (!quiz) notFound();

  return (
    <div>
      <Link href="/quizzes" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> quizzes
      </Link>
      <PageHeader title={quiz.title} description={`Generated from ${quiz.sourceLabel} — ${quiz.questions.length} questions.`} />
      <TakeQuiz quiz={quiz} />
    </div>
  );
}
