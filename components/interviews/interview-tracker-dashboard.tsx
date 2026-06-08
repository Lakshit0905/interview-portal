"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, Check, X } from "lucide-react";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { createInterview, updateInterview, setInterviewStatus, deleteInterview } from "@/lib/actions/interviews";
import { cn, nowISO } from "@/lib/utils";
import type { InterviewInsights, UpcomingInterview } from "@/lib/data/interview-insights";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReadinessGauge } from "@/components/dashboard/readiness-gauge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { KpiCards } from "./kpi-cards";
import { PipelineBoard } from "./pipeline-board";
import { UpcomingTimeline } from "./upcoming-timeline";
import { CompanyInsights } from "./company-insights";
import { AnalyticsCharts } from "./analytics-charts";
import { ActivityFeed } from "./activity-feed";
import { InterviewFormDialog, EMPTY_INTERVIEW_DRAFT, type InterviewDraft } from "./interview-form-dialog";
import { InterviewDetailDialog } from "./interview-detail-dialog";

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

function matches(iv: Interview, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [iv.company, iv.position, iv.round, iv.recruiter, iv.location]
    .some((field) => field?.toLowerCase().includes(q));
}

export function InterviewTrackerDashboard({ initial, insights }: { initial: Interview[]; insights: InterviewInsights }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<Set<InterviewStatus>>(new Set());
  const [pending, startTransition] = React.useTransition();

  const [formOpen, setFormOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<InterviewDraft>(EMPTY_INTERVIEW_DRAFT);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(initial), [initial]);

  const detailInterview = items.find((i) => i.id === detailId) ?? null;

  const passesFilter = React.useCallback(
    (iv: Interview) => matches(iv, query) && (statusFilter.size === 0 || statusFilter.has(iv.status)),
    [query, statusFilter],
  );
  const filteredItems = React.useMemo(() => items.filter(passesFilter), [items, passesFilter]);
  const filteredUpcoming = React.useMemo(
    () => insights.upcoming.filter((u) => passesFilter(u)),
    [insights.upcoming, passesFilter],
  );

  function openCreate() { setDraft(EMPTY_INTERVIEW_DRAFT); setFormOpen(true); }
  function openEdit(iv: Interview) { setDraft(iv); setFormOpen(true); }
  function openView(iv: Interview | UpcomingInterview) { setDetailId(iv.id); setDetailOpen(true); }

  function save() {
    const payload = {
      company: draft.company?.trim() || "Unknown",
      position: draft.position?.trim() || "SDET",
      location: draft.location?.trim() || undefined,
      salaryRange: draft.salaryRange?.trim() || undefined,
      interviewType: draft.interviewType || undefined,
      recruiter: draft.recruiter?.trim() || undefined,
      interviewDate: draft.interviewDate || null,
      round: draft.round ?? "",
      roundsCompleted: draft.roundsCompleted ?? 0,
      roundsTotal: draft.roundsTotal ?? 0,
      readinessScore: draft.readinessScore ?? 0,
      status: draft.status as InterviewStatus,
      notes: draft.notes ?? "",
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateInterview(draft.id, payload);
        if (updated) setItems((c) => c.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createInterview(payload);
        setItems((c) => [created, ...c]);
      }
      setFormOpen(false);
      router.refresh();
    });
  }

  function move(iv: Interview, status: InterviewStatus) {
    setItems((c) => c.map((x) => (x.id === iv.id ? { ...x, status, updatedAt: nowISO() } : x)));
    startTransition(async () => { await setInterviewStatus(iv.id, status); router.refresh(); });
  }

  function remove(iv: Interview) {
    setItems((c) => c.filter((x) => x.id !== iv.id));
    startTransition(async () => { await deleteInterview(iv.id); router.refresh(); });
  }

  function addNote(note: string) {
    if (!detailInterview) return;
    const merged = detailInterview.notes ? `${detailInterview.notes}\n\n${note}` : note;
    setItems((c) => c.map((x) => (x.id === detailInterview.id ? { ...x, notes: merged, updatedAt: nowISO() } : x)));
    startTransition(async () => { await updateInterview(detailInterview.id, { notes: merged }); router.refresh(); });
  }

  function changeDetailStatus(status: InterviewStatus) {
    if (!detailInterview) return;
    move(detailInterview, status);
  }

  function toggleStatusFilter(status: InterviewStatus) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }

  const cardActions = {
    onView: openView,
    onEdit: openEdit,
    onAddNotes: (iv: Interview) => openView(iv),
    onStatusChange: move,
    onDelete: remove,
  };

  return (
    <div>
      <PageHeader
        title="Interview Tracker"
        description="Your end-to-end pipeline — applications, upcoming rounds, readiness, and outcomes in one view."
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, round…"
            className="h-9 w-56 pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
              {statusFilter.size > 0 && <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 font-mono text-[0.6rem] text-primary">{statusFilter.size}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {INTERVIEW_STATUSES.map((s) => {
              const a = ACCENT_CLASS[STATUS_ACCENT[s] ?? "slate"];
              const checked = statusFilter.has(s);
              return (
                <DropdownMenuItem key={s} onSelect={(e) => { e.preventDefault(); toggleStatusFilter(s); }}>
                  <span className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-sm border", checked ? "border-primary bg-primary/20" : "border-border")}>
                    {checked && <Check className="h-3 w-3 text-primary" />}
                  </span>
                  <span className={cn("h-2 w-2 rounded-full", a.dot)} /> {s}
                </DropdownMenuItem>
              );
            })}
            {statusFilter.size > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setStatusFilter(new Set()); }}>
                  <X className="h-4 w-4" /> Clear filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add interview</Button>
      </PageHeader>

      <div className="space-y-10">
        <section>
          <KpiCards kpis={insights.kpis} />
        </section>

        <section>
          <SectionHeading title="Interview pipeline" description="Drag a card to a new column to update its status — drops persist instantly." />
          <PipelineBoard items={filteredItems} onMove={move} {...cardActions} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <SectionHeading title="Upcoming interviews" description="Scheduled rounds, soonest first." />
            <UpcomingTimeline items={filteredUpcoming} onView={openView} />
          </div>
          <div className="xl:col-span-2">
            <SectionHeading title="Interview readiness" description="Derived from your knowledge base, behavioral prep, and system-design coverage." />
            <ReadinessGauge score={insights.readiness.score} breakdown={insights.readiness.breakdown}
              indicatorClassName="bg-gradient-to-r from-signal-blue to-signal-violet" />
          </div>
        </section>

        <section>
          <SectionHeading title="Company insights" description="Where every application stands — progress, readiness, and notes at a glance." />
          <CompanyInsights companies={insights.companies} />
        </section>

        <section>
          <SectionHeading title="Analytics" description="Trends across your pipeline over the last six months." />
          <AnalyticsCharts analytics={insights.analytics} />
        </section>

        <section>
          <SectionHeading title="Recent activity" description="A live trail of everything that's changed across your pipeline and resumes." />
          <ActivityFeed items={insights.activity} />
        </section>
      </div>

      <InterviewFormDialog open={formOpen} onOpenChange={setFormOpen} draft={draft} onChange={setDraft} onSave={save} pending={pending} />
      <InterviewDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        interview={detailInterview}
        onStatusChange={changeDetailStatus}
        onAddNote={addNote}
        pending={pending}
      />
    </div>
  );
}
