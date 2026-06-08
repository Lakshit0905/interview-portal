import "server-only";
import { db } from "./db";
import { getAllNotes } from "./knowledge";
import { calendarDaysUntil, splitNotes } from "@/lib/utils";
import type { Interview, InterviewStatus } from "@/types";

const DAY = 86_400_000;
const PIPELINE_STAGES: InterviewStatus[] = ["Applied", "Recruiter Screen", "Technical Round", "Final Round", "Offer"];

export interface TrendMetric {
  value: number;
  trend: number; // signed % change vs. the prior period, scaled by current total
  spark: number[]; // small monthly series for the sparkline
}

export type Urgency = "today" | "tomorrow" | "week" | "future";

export interface UpcomingInterview extends Interview {
  daysAway: number;
  urgency: Urgency;
}

export interface CompanyInsight {
  company: string;
  applicationDate: string;
  status: InterviewStatus;
  roundsCompleted: number;
  roundsTotal: number;
  readinessScore: number;
  notesCount: number;
}

export type ActivityType = "added" | "status" | "offer" | "resume";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface InterviewInsights {
  kpis: {
    totalApplications: TrendMetric;
    activeInterviews: TrendMetric;
    finalRounds: TrendMetric;
    offers: TrendMetric;
    successRate: { value: number; trend: number };
  };
  upcoming: UpcomingInterview[];
  companies: CompanyInsight[];
  analytics: {
    applicationsPerMonth: { month: string; applications: number }[];
    successByRound: { stage: string; rate: number }[];
    funnel: { stage: string; count: number }[];
    companyDistribution: { name: string; value: number }[];
  };
  activity: ActivityItem[];
  readiness: { score: number; breakdown: { label: string; value: number }[] };
}

// ── time-bucket helpers ──────────────────────────────────────────────────────

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

function lastMonthKeys(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function monthlyCounts(items: Interview[], months: string[], match: (iv: Interview) => boolean): number[] {
  const byMonth = new Map<string, number>();
  for (const iv of items) {
    if (!match(iv)) continue;
    const k = monthKey(iv.createdAt);
    byMonth.set(k, (byMonth.get(k) ?? 0) + 1);
  }
  return months.map((m) => byMonth.get(m) ?? 0);
}

function ageDays(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / DAY;
}

/** Net change between the last 30 days and the 30 days before that, as a share of the current total. */
function trendMetric(items: Interview[], months: string[], dateField: "createdAt" | "updatedAt", match: (iv: Interview) => boolean): TrendMetric {
  let recent = 0, prior = 0, total = 0;
  for (const iv of items) {
    if (!match(iv)) continue;
    total++;
    const age = ageDays(iv[dateField] ?? iv.createdAt);
    if (age <= 30) recent++;
    else if (age <= 60) prior++;
  }
  const trend = total === 0 ? 0 : Math.round(((recent - prior) / total) * 100);
  return { value: total, trend, spark: monthlyCounts(items, months, match) };
}

// ── grouping & derivation ────────────────────────────────────────────────────

const isActive = (iv: Interview) => iv.status !== "Offer" && iv.status !== "Rejected";

function groupByCompany(items: Interview[]): Map<string, Interview[]> {
  const map = new Map<string, Interview[]>();
  for (const iv of items) {
    const list = map.get(iv.company) ?? [];
    list.push(iv);
    map.set(iv.company, list);
  }
  return map;
}

function buildUpcoming(items: Interview[]): UpcomingInterview[] {
  return items
    .filter((iv): iv is Interview & { interviewDate: string } => {
      if (!iv.interviewDate || iv.status === "Rejected") return false;
      const d = calendarDaysUntil(iv.interviewDate);
      return d !== null && d >= 0;
    })
    .map((iv) => {
      const daysAway = calendarDaysUntil(iv.interviewDate)!;
      const urgency: Urgency = daysAway <= 0 ? "today" : daysAway === 1 ? "tomorrow" : daysAway <= 7 ? "week" : "future";
      return { ...iv, daysAway, urgency };
    })
    .sort((a, b) => a.daysAway - b.daysAway);
}

function buildCompanyInsights(byCompany: Map<string, Interview[]>): CompanyInsight[] {
  return [...byCompany.entries()]
    .map(([company, list]) => {
      const latest = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      const earliest = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      return {
        company,
        applicationDate: earliest.createdAt,
        status: latest.status,
        roundsCompleted: latest.roundsCompleted ?? 0,
        roundsTotal: latest.roundsTotal ?? 0,
        readinessScore: latest.readinessScore ?? 0,
        notesCount: list.reduce((sum, iv) => sum + splitNotes(iv.notes).length, 0),
      };
    })
    .sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));
}

function buildAnalytics(items: Interview[], byCompany: Map<string, Interview[]>, months: string[]) {
  const applicationsPerMonth = months.map((key) => ({
    month: monthLabel(key),
    applications: monthlyCounts(items, [key], () => true)[0],
  }));

  // Cumulative "reached at least this stage" counts, derived from rounds completed (and final status for Offer).
  const reached = [
    items.length,
    items.filter((i) => (i.roundsCompleted ?? 0) >= 1).length,
    items.filter((i) => (i.roundsCompleted ?? 0) >= 2).length,
    items.filter((i) => (i.roundsCompleted ?? 0) >= 3).length,
    items.filter((i) => i.status === "Offer").length,
  ];
  const funnel = PIPELINE_STAGES.map((stage, i) => ({ stage, count: reached[i] }));
  const successByRound = PIPELINE_STAGES.slice(0, -1).map((stage, i) => ({
    stage: `${stage} → ${PIPELINE_STAGES[i + 1]}`,
    rate: reached[i] === 0 ? 0 : Math.round((reached[i + 1] / reached[i]) * 100),
  }));

  const companyDistribution = [...byCompany.entries()]
    .map(([name, list]) => ({ name, value: list.length }))
    .sort((a, b) => b.value - a.value);

  return { applicationsPerMonth, successByRound, funnel, companyDistribution };
}

function buildActivity(items: Interview[], resumes: { id: string; label: string; version: string; updatedAt: string }[]): ActivityItem[] {
  const activity: ActivityItem[] = [];
  for (const iv of items) {
    activity.push({
      id: `${iv.id}_added`, type: "added",
      title: `Application added — ${iv.company}`,
      description: iv.position,
      timestamp: iv.createdAt,
    });
    if (iv.updatedAt !== iv.createdAt) {
      if (iv.status === "Offer") {
        activity.push({
          id: `${iv.id}_offer`, type: "offer",
          title: `Offer received — ${iv.company}`,
          description: iv.position,
          timestamp: iv.updatedAt,
        });
      } else {
        activity.push({
          id: `${iv.id}_status`, type: "status",
          title: `Status changed to "${iv.status}" — ${iv.company}`,
          description: iv.round || iv.position,
          timestamp: iv.updatedAt,
        });
      }
    }
  }
  for (const r of resumes) {
    activity.push({
      id: `${r.id}_resume`, type: "resume",
      title: `Resume updated — ${r.label}`,
      description: r.version,
      timestamp: r.updatedAt,
    });
  }
  return activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10);
}

async function buildReadiness() {
  const [notes, behavioral, systemDesigns] = await Promise.all([
    getAllNotes(), db.behavioral.list(), db.systemDesign.list(),
  ]);
  const countIn = (slug: string) => notes.filter((n) => n.category === slug).length;
  const frac = (count: number, target: number) => Math.min(1, count / target);

  const breakdown = [
    { label: "Playwright", value: frac(countIn("playwright"), 3) },
    { label: "TypeScript", value: frac(countIn("typescript"), 3) },
    { label: "API Testing", value: frac(countIn("api-testing"), 3) },
    { label: "SQL", value: frac(countIn("sql"), 3) },
    { label: "Docker", value: frac(countIn("cicd"), 3) },
    { label: "AWS", value: frac(countIn("aws"), 3) },
    { label: "System Design", value: frac(countIn("system-design") + systemDesigns.length, 3) },
    { label: "Behavioral", value: frac(behavioral.length, 4) },
  ];
  const score = Math.round((breakdown.reduce((sum, b) => sum + b.value, 0) / breakdown.length) * 100);
  return { score, breakdown };
}

// ── public entrypoint ────────────────────────────────────────────────────────

export async function getInterviewInsights(): Promise<InterviewInsights> {
  const [items, resumes, readiness] = await Promise.all([
    db.interviews.list(), db.resumes.list(), buildReadiness(),
  ]);

  const months = lastMonthKeys(6);
  const byCompany = groupByCompany(items);

  const offerOrRejected = items.filter((i) => i.status === "Offer" || i.status === "Rejected");
  const recentConcluded = offerOrRejected.filter((i) => ageDays(i.updatedAt) <= 30);
  const olderConcluded = offerOrRejected.filter((i) => ageDays(i.updatedAt) > 30);
  const rateOf = (list: Interview[]) => {
    const offers = list.filter((i) => i.status === "Offer").length;
    return list.length === 0 ? null : Math.round((offers / list.length) * 100);
  };
  const recentRate = rateOf(recentConcluded);
  const olderRate = rateOf(olderConcluded);
  const offers = items.filter((i) => i.status === "Offer").length;
  const rejected = items.filter((i) => i.status === "Rejected").length;

  return {
    kpis: {
      totalApplications: trendMetric(items, months, "createdAt", () => true),
      activeInterviews: trendMetric(items, months, "updatedAt", isActive),
      finalRounds: trendMetric(items, months, "updatedAt", (iv) => iv.status === "Final Round"),
      offers: trendMetric(items, months, "updatedAt", (iv) => iv.status === "Offer"),
      successRate: {
        value: offers + rejected === 0 ? 0 : Math.round((offers / (offers + rejected)) * 100),
        trend: recentRate !== null && olderRate !== null ? recentRate - olderRate : 0,
      },
    },
    upcoming: buildUpcoming(items),
    companies: buildCompanyInsights(byCompany),
    analytics: buildAnalytics(items, byCompany, months),
    activity: buildActivity(items, resumes),
    readiness,
  };
}
