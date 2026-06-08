import { notFound } from "next/navigation";
import { db } from "@/lib/data/db";
import { VideoDetail } from "@/components/videos/video-detail";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await db.videos.get(id);
  if (!video) notFound();

  return <VideoDetail video={video} />;
}
