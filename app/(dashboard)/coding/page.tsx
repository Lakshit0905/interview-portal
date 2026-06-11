import { Suspense } from "react";
import { db } from "@/lib/data/db";
import { PageHeader } from "@/components/shared/page-header";
import { CodingBoard } from "@/components/coding/coding-board";
import { CodingDashboard } from "@/components/coding/dashboard/coding-dashboard";
import { buildCodingDashboardStats } from "@/lib/coding-stats";

export default async function CodingPage() {
  const [problems, activity] = await Promise.all([db.coding.list(), db.codingActivity.list()]);
  const stats = buildCodingDashboardStats(problems, activity);

  return (
    <div className="coding-dashboard">
      <PageHeader
        title="Coding Tracker"
        description="A LeetCode-style log of problems with solutions, complexity, and spaced revisits. Toggle the status dot to cycle to do → solved → revisit."
      />
      <div className="mb-8">
        <CodingDashboard stats={stats} />
      </div>
      <Suspense>
        <CodingBoard initial={problems} />
      </Suspense>
    </div>
  );
}
