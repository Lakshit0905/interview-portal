import Link from "next/link";
import { ArrowLeft, Clock, Sparkles, WifiOff } from "lucide-react";
import type { VideoLesson } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { LessonMarkdown } from "./lesson-markdown";
import { VideoConcepts } from "./video-concepts";
import { VideoQaList } from "./video-qa";
import { VideoFlashcards } from "./video-flashcards";
import { VideoMcqQuiz } from "./video-mcq-quiz";

export function VideoDetail({ video }: { video: VideoLesson }) {
  return (
    <div>
      <Link href="/videos" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> video learning hub
      </Link>

      <div className="mb-7">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-muted-foreground">{video.topic}</Badge>
          <Badge variant="muted" className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {video.durationMinutes} min</Badge>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[0.7rem]",
              video.generatedByAi
                ? "border-signal-green/30 bg-signal-green/10 text-signal-green"
                : "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
            )}
          >
            {video.generatedByAi ? <Sparkles className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {video.generatedByAi ? "AI-generated" : "Offline-generated"}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance">{video.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{video.channel}</p>
        <a href={video.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary underline underline-offset-4 hover:text-primary/80">
          {video.url}
        </a>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">{video.summary}</p>
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="revision">Revision &amp; cheat sheet</TabsTrigger>
          <TabsTrigger value="quiz">MCQ quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <LessonMarkdown source={video.notes} />
        </TabsContent>
        <TabsContent value="concepts">
          <VideoConcepts concepts={video.concepts} />
        </TabsContent>
        <TabsContent value="qa">
          <VideoQaList items={video.questions} />
        </TabsContent>
        <TabsContent value="flashcards">
          <VideoFlashcards cards={video.flashcards} />
        </TabsContent>
        <TabsContent value="revision">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mono-label mb-2">Revision notes</p>
              <LessonMarkdown source={video.revisionNotes} />
            </div>
            <div>
              <p className="mono-label mb-2">Cheat sheet</p>
              <LessonMarkdown source={video.cheatSheet} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="quiz">
          <VideoMcqQuiz mcqs={video.mcqs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
