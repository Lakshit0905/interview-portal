import "server-only";
import { prisma } from "@/lib/prisma";
import { JsonCollection } from "@/lib/repositories/json-store";
import { PrismaCollection } from "@/lib/repositories/prisma-store";
import type {
  CodingProblem, InterviewQuestion, BehavioralStory,
  SystemDesign, Resume, Interview, Flashcard, LearningPath, CompanyPrep, VideoLesson,
  Quiz, QuizAttempt, CodingActivityEntry,
} from "@/types";
import {
  codingSeed, questionSeed, behavioralSeed,
  systemDesignSeed, resumeSeed, interviewSeed, flashcardSeed, roadmapSeed, companyPrepSeed,
  videoLessonSeed, quizSeed, quizAttemptSeed, codingActivitySeed,
} from "./seeds";

const jsonDb = {
  coding: new JsonCollection<CodingProblem>("coding-problems", codingSeed),
  questions: new JsonCollection<InterviewQuestion>("questions", questionSeed),
  behavioral: new JsonCollection<BehavioralStory>("behavioral", behavioralSeed),
  systemDesign: new JsonCollection<SystemDesign>("system-design", systemDesignSeed),
  resumes: new JsonCollection<Resume>("resumes", resumeSeed),
  interviews: new JsonCollection<Interview>("interviews", interviewSeed),
  flashcards: new JsonCollection<Flashcard>("flashcards", flashcardSeed),
  roadmap: new JsonCollection<LearningPath>("roadmap", roadmapSeed),
  companyPrep: new JsonCollection<CompanyPrep>("company-prep", companyPrepSeed),
  videos: new JsonCollection<VideoLesson>("video-lessons", videoLessonSeed),
  quizzes: new JsonCollection<Quiz>("quizzes", quizSeed),
  quizAttempts: new JsonCollection<QuizAttempt>("quiz-attempts", quizAttemptSeed),
  codingActivity: new JsonCollection<CodingActivityEntry>("coding-activity", codingActivitySeed),
};

const prismaDb = {
  coding: new PrismaCollection<CodingProblem>(prisma.codingProblem),
  questions: new PrismaCollection<InterviewQuestion>(prisma.interviewQuestion),
  behavioral: new PrismaCollection<BehavioralStory>(prisma.behavioralStory),
  systemDesign: new PrismaCollection<SystemDesign>(prisma.systemDesign),
  resumes: new PrismaCollection<Resume>(prisma.resume),
  interviews: new PrismaCollection<Interview>(prisma.interview),
  flashcards: new PrismaCollection<Flashcard>(prisma.flashcard),
  roadmap: new PrismaCollection<LearningPath>(prisma.learningPath),
  companyPrep: new PrismaCollection<CompanyPrep>(prisma.companyPrep),
  videos: new PrismaCollection<VideoLesson>(prisma.videoLesson),
  quizzes: new PrismaCollection<Quiz>(prisma.quiz),
  quizAttempts: new PrismaCollection<QuizAttempt>(prisma.quizAttempt),
  codingActivity: new PrismaCollection<CodingActivityEntry>(prisma.codingActivityEntry),
};

/**
 * Central data access. DATA_DRIVER=json keeps the zero-infra local default.
 * DATA_DRIVER=prisma switches every collection to Postgres via Prisma.
 */
export const db = process.env.DATA_DRIVER === "prisma" ? prismaDb : jsonDb;
