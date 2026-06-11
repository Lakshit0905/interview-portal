import { db } from "@/lib/data/db";
import { QuizzesClient } from "@/components/quizzes/quizzes-client";

export default async function QuizzesPage() {
  const [quizzes, attempts] = await Promise.all([db.quizzes.list(), db.quizAttempts.list()]);
  return <QuizzesClient quizzes={quizzes} attempts={attempts} />;
}
