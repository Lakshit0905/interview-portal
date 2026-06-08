import type { RevisionSheet } from "@/lib/data/revision";
import { PageHeader } from "@/components/shared/page-header";

import { RevisionStatsRow } from "./revision-stats";
import { WeakAreas } from "./weak-areas";
import { RevisionChecklist } from "./revision-checklist";

export function RevisionOverview({ sheet }: { sheet: RevisionSheet }) {
  return (
    <div>
      <PageHeader
        title="Revision Center"
        description="A fresh sheet every day — built from your due flashcards, flagged problems, and the topics where your mastery is lowest."
      />

      <div className="mb-6"><RevisionStatsRow sheet={sheet} /></div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <RevisionChecklist items={sheet.items} date={sheet.date} />
        <WeakAreas areas={sheet.weakAreas} />
      </div>
    </div>
  );
}
