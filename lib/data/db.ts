import "server-only";
import { JsonCollection } from "@/lib/repositories/json-store";
import type {
  CodingProblem, InterviewQuestion, BehavioralStory,
  SystemDesign, Resume, Interview, Flashcard, LearningPath, CompanyPrep, VideoLesson,
} from "@/types";
import {
  codingSeed, questionSeed, behavioralSeed,
  systemDesignSeed, resumeSeed, interviewSeed, flashcardSeed, roadmapSeed, companyPrepSeed,
  videoLessonSeed,
} from "./seeds";

/**
 * Central data access. Today every collection is a JSON file (DATA_DRIVER=json).
 * To migrate to PostgreSQL, implement the `Repository<T>` interface with Prisma
 * and swap the constructions below behind `process.env.DATA_DRIVER === "prisma"`.
 * Callers never change.
 */
export const db = {
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
};
