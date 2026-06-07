import Link from "next/link";
import { getDashboardStats } from "@/lib/data/stats";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReadinessGauge } from "@/components/dashboard/readiness-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { formatDate, relativeTime, daysUntil } from "@/lib/utils";
import { KNOWLEDGE_CATEGORIES, STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { ArrowUpRight, CalendarClock } from "lucide-react";

export default async function DashboardPage() {
  const s = await getDashboardStats();
  return (
    <div className="space-y-7">
      <div>
        <p className="mono-label">command center</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back, engineer.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s where your interview prep stands today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Topics tracked" value={s.totalTopics} sub={`${s.totalNotes} notes`} icon="Library" accent="blue" />
        <StatCard index={1} label="Coding problems" value={s.totalCoding} sub={`${s.solvedCoding} solved`} icon="Code2" accent="green" />
        <StatCard index={2} label="Topics completed" value={`${s.topicsCompleted}/${s.topicsTotal}`} sub="2+ notes" icon="CheckCircle2" accent="violet" />
        <StatCard index={3} label="Readiness score" value={s.readiness} sub="weighted" icon="Gauge" accent="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><ReadinessGauge score={s.readiness} breakdown={s.readinessBreakdown} /></div>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Upcoming Interviews</CardTitle>
            <Link href="/interviews" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {s.upcomingInterviews.length === 0 && <p className="text-sm text-muted-foreground">No interviews scheduled.</p>}
            {s.upcomingInterviews.map((iv) => {
              const d = daysUntil(iv.interviewDate);
              const accent = ACCENT_CLASS[STATUS_ACCENT[iv.status]] ?? ACCENT_CLASS.blue;
              return (
                <Link key={iv.id} href="/interviews" className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{iv.company}</span>
                    <span className={`font-mono text-xs ${accent.text}`}>{d === 0 ? "today" : `${d}d`}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{iv.position}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="muted">{iv.round}</Badge>
                    <span className="font-mono text-[0.65rem] text-muted-foreground">{formatDate(iv.interviewDate)}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recently Updated Notes</CardTitle>
            <Link href="/knowledge" className="text-xs text-muted-foreground hover:text-foreground">Knowledge base →</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {s.recentNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Add MDX files under <code className="font-mono">/content</code>.</p>}
            {s.recentNotes.map((n) => (
              <Link key={`${n.category}/${n.slug}`} href={`/knowledge/${n.category}/${n.slug}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Icon name={KNOWLEDGE_CATEGORIES.find((c) => c.slug === n.category)?.icon ?? "FileText"} className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{n.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{n.category} · {n.readingTime} min read</div>
                </div>
                <span className="font-mono text-[0.65rem] text-muted-foreground">{relativeTime(n.updatedAt)}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Coding by Difficulty</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(["Easy", "Medium", "Hard"] as const).map((d) => {
              const accent = d === "Easy" ? ACCENT_CLASS.green : d === "Medium" ? ACCENT_CLASS.amber : ACCENT_CLASS.red;
              const count = s.codingByDifficulty[d];
              const pct = s.totalCoding ? (count / s.totalCoding) * 100 : 0;
              return (
                <div key={d}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${accent.dot}`} />{d}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${accent.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <Link href="/coding" className="mt-2 block rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground hover:bg-muted transition-colors">Open coding tracker →</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
