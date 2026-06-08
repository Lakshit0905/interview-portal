import { db } from "@/lib/data/db";
import { RoadmapClient } from "@/components/roadmap/roadmap-client";

export default async function RoadmapPage() {
  const paths = await db.roadmap.list();
  return <RoadmapClient initial={paths} />;
}
