import { Suspense } from "react";
import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { QuestionBank } from "@/components/coding/question-bank";

export default async function QuestionsPage() {
  const questions = await db.questions.list();
  return (
    <div>
      <PageHeader
        title="Question Bank"
        description="Curated interview questions with model answers, organized by category and difficulty."
      />
      <Suspense>
        <QuestionBank initial={questions} />
      </Suspense>
    </div>
  );
}
