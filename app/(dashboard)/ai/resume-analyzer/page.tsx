import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerClient } from "@/components/interviews/analyzer-client";

export default async function ResumeAnalyzerPage() {
  const resumes = (await db.resumes.list())
    .filter((r) => r.content?.trim())
    .map((r) => ({ id: r.id, label: r.label, content: r.content! }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Resume Analyzer"
        description="Compare a resume against a job description for an ATS-style match score, matched and missing keywords, and concrete improvements."
      />
      <AnalyzerClient resumes={resumes} />
    </div>
  );
}
