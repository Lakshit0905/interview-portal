import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { ResumeBoard } from "@/components/interviews/resume-board";

export default async function ResumesPage() {
  const resumes = await db.resumes.list();
  return (
    <div>
      <PageHeader
        title="Resume Manager"
        description="Version every tailored resume, track the company it targets, and store plain text for the AI analyzer."
      />
      <ResumeBoard initial={resumes} />
    </div>
  );
}
