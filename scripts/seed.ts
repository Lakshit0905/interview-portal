import { promises as fs } from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import {
  codingSeed, questionSeed, behavioralSeed,
  systemDesignSeed, resumeSeed, interviewSeed, flashcardSeed, roadmapSeed,
  companyPrepSeed, videoLessonSeed, quizSeed, quizAttemptSeed, codingActivitySeed,
} from "../lib/data/seeds";

const DATA_DIR = path.join(process.cwd(), "data");

type SeedCollection = {
  file: string;
  data: unknown[];
  delegate: {
    upsert(args: unknown): Promise<unknown>;
  };
};

const DATE_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "revisitDate",
  "interviewDate",
  "lastReviewedAt",
  "dueAt",
  "lastRevisedAt",
  "nextRevisionAt",
  "completedAt",
]);

const COLLECTIONS: SeedCollection[] = [
  { file: "coding-problems.json", data: codingSeed, delegate: prisma.codingProblem },
  { file: "questions.json", data: questionSeed, delegate: prisma.interviewQuestion },
  { file: "behavioral.json", data: behavioralSeed, delegate: prisma.behavioralStory },
  { file: "system-design.json", data: systemDesignSeed, delegate: prisma.systemDesign },
  { file: "resumes.json", data: resumeSeed, delegate: prisma.resume },
  { file: "interviews.json", data: interviewSeed, delegate: prisma.interview },
  { file: "flashcards.json", data: flashcardSeed, delegate: prisma.flashcard },
  { file: "roadmap.json", data: roadmapSeed, delegate: prisma.learningPath },
  { file: "company-prep.json", data: companyPrepSeed, delegate: prisma.companyPrep },
  { file: "video-lessons.json", data: videoLessonSeed, delegate: prisma.videoLesson },
  { file: "quizzes.json", data: quizSeed, delegate: prisma.quiz },
  { file: "quiz-attempts.json", data: quizAttemptSeed, delegate: prisma.quizAttempt },
  { file: "coding-activity.json", data: codingActivitySeed, delegate: prisma.codingActivityEntry },
];

function toPrismaData(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      DATE_KEYS.has(key) && typeof value === "string" ? new Date(value) : value,
    ]),
  );
}

async function seedJson() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const { file, data } of COLLECTIONS) {
    await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
    console.log(`seeded ${file} (${data.length} records)`);
  }
}

async function seedPrisma() {
  for (const { file, data, delegate } of COLLECTIONS) {
    for (const row of data) {
      const entity = row as Record<string, unknown>;
      const prismaData = toPrismaData(entity);
      await delegate.upsert({
        where: { id: entity.id },
        update: prismaData,
        create: prismaData,
      });
    }
    console.log(`seeded ${file.replace(".json", "")} (${data.length} records)`);
  }
}

async function main() {
  if (process.env.DATA_DRIVER === "prisma") {
    await seedPrisma();
    await prisma.$disconnect();
    console.log("\nSeed complete. DATA_DRIVER=prisma is ready.");
    return;
  }

  await seedJson();
  console.log("\nSeed complete. Start the app with `npm run dev`.");
}

main().catch((err) => {
  console.error(err);
  void prisma.$disconnect();
  process.exit(1);
});
