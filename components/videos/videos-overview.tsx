"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { VideoLesson } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

import { VideoCard } from "./video-card";
import { AddVideoDialog } from "./add-video-dialog";

export function VideosOverview({ initial }: { initial: VideoLesson[] }) {
  const [items, setItems] = React.useState(initial);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const router = useRouter();

  function handleCreated(lesson: VideoLesson) {
    setItems((prev) => [lesson, ...prev]);
    router.push(`/videos/${lesson.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Video Learning Hub"
        description="Drop in a YouTube URL and its transcript — get back AI-generated notes, concepts, Q&A, flashcards, revision notes, a cheat sheet, and an MCQ quiz, all saved for later review."
      >
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add video
        </Button>
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState icon="Video" title="No video lessons yet"
          description="Paste a YouTube URL and its transcript to generate your first set of study material." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
        </div>
      )}

      <AddVideoDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={handleCreated} />
    </div>
  );
}
