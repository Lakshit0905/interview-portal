import { buildRevisionSheet } from "@/lib/data/revision";
import { RevisionOverview } from "@/components/revision/revision-overview";

export default async function RevisionPage() {
  const sheet = await buildRevisionSheet();
  return <RevisionOverview sheet={sheet} />;
}
