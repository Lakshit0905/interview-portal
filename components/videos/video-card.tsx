"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Layers, HelpCircle, ListChecks, Sparkles, WifiOff } from "lucide-react";
import type { VideoLesson } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn, relativeTime } from "@/lib/utils";

export function VideoCard({ video, index }: { video: VideoLesson; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/videos/${video.id}`}
        className="card-glow group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
      >
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-muted-foreground">{video.topic}</Badge>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[0.7rem]",
              video.generatedByAi
                ? "border-signal-green/30 bg-signal-green/10 text-signal-green"
                : "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
            )}
          >
            {video.generatedByAi ? <Sparkles className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {video.generatedByAi ? "AI-generated" : "Offline"}
          </span>
        </div>

        <h3 className="mt-3 font-semibold leading-snug tracking-tight text-balance group-hover:text-primary">
          {video.title}
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{video.channel}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{video.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 font-mono text-[0.7rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {video.durationMinutes} min</span>
          <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {video.flashcards.length} cards</span>
          <span className="inline-flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {video.questions.length} Q&amp;A</span>
          <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" /> {video.mcqs.length} MCQs</span>
          <span className="ml-auto">{relativeTime(video.updatedAt)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
