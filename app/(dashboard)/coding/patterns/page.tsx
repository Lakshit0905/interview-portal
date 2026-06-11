import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PatternTemplatesPage } from "@/components/coding/pattern-templates-page";

export default function CodingPatternsPage() {
  return (
    <div>
      <Link href="/coding" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> coding tracker
      </Link>
      <PageHeader
        title="Patterns"
        description="Reusable algorithm templates for learning, memorizing, and revising common coding interview patterns."
      />
      <PatternTemplatesPage />
    </div>
  );
}
