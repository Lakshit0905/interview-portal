import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { InterviewBoard } from "@/components/interviews/interview-board";

export default async function InterviewsPage() {
  const interviews = await db.interviews.list();
  return (
    <div>
      <PageHeader
        title="Interview Tracker"
        description="Your pipeline as a board — drag-free status moves from Applied through Offer, with date countdowns."
      />
      <InterviewBoard initial={interviews} />
    </div>
  );
}
