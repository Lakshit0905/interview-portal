import { db } from "@/lib/data/db";
import { getInterviewInsights } from "@/lib/data/interview-insights";
import { InterviewTrackerDashboard } from "@/components/interviews/interview-tracker-dashboard";

export default async function InterviewsPage() {
  const [interviews, insights] = await Promise.all([db.interviews.list(), getInterviewInsights()]);
  return <InterviewTrackerDashboard initial={interviews} insights={insights} />;
}
