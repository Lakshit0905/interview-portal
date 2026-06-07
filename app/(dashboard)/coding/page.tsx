import { Suspense } from "react";
import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { CodingBoard } from "@/components/coding/coding-board";

export default async function CodingPage() {
  const problems = await db.coding.list();
  return (
    <div>
      <PageHeader
        title="Coding Tracker"
        description="A LeetCode-style log of problems with solutions, complexity, and spaced revisits. Toggle the status dot to cycle to do → solved → revisit."
      />
      <Suspense>
        <CodingBoard initial={problems} />
      </Suspense>
    </div>
  );
}
