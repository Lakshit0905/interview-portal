import { db } from "@/lib/data/db";
import { VideosOverview } from "@/components/videos/videos-overview";

export default async function VideosPage() {
  const videos = await db.videos.list();
  return <VideosOverview initial={videos} />;
}
