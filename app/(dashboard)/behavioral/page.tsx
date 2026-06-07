import { Suspense } from "react";
import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { StoryBoard } from "@/components/coding/story-board";

export default async function BehavioralPage() {
  const stories = await db.behavioral.list();
  return (
    <div>
      <PageHeader
        title="Behavioral Stories"
        description="Your STAR-format library — Situation, Task, Action, Result — tuned for SDET leadership and impact narratives."
      />
      <Suspense>
        <StoryBoard initial={stories} />
      </Suspense>
    </div>
  );
}
