"use client";

import * as React from "react";
import {
  DndContext, DragOverlay, PointerSensor, closestCorners, useDraggable, useDroppable,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { InterviewCard, type InterviewCardActions } from "./interview-card";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_SET: readonly string[] = INTERVIEW_STATUSES;

function DraggableCard({ interview, ...actions }: { interview: Interview } & InterviewCardActions) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: interview.id });
  const style: React.CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("touch-none", isDragging && "z-10 opacity-40")}>
      <InterviewCard interview={interview} {...actions} />
    </div>
  );
}

function DroppableColumn({ status, items, ...actions }: { status: InterviewStatus; items: Interview[] } & InterviewCardActions) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const a = ACCENT_CLASS[STATUS_ACCENT[status] ?? "slate"];
  return (
    <div className="min-w-[260px] lg:min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", a.dot)} />
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{status}</h3>
        <span className="ml-auto font-mono text-xs text-muted-foreground/60">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[140px] space-y-2.5 rounded-xl border border-dashed p-1.5 transition-colors",
          isOver ? "border-primary/40 bg-primary/[0.04]" : "border-transparent",
        )}
      >
        {items.length === 0 ? (
          <div className={cn(
            "rounded-xl border border-dashed py-8 text-center font-mono text-[0.65rem] text-muted-foreground transition-colors",
            isOver ? "border-primary/40" : "border-border/60",
          )}>
            Drop here
          </div>
        ) : items.map((iv) => <DraggableCard key={iv.id} interview={iv} {...actions} />)}
      </div>
    </div>
  );
}

export function PipelineBoard({ items, onMove, ...actions }: {
  items: Interview[];
  onMove: (interview: Interview, status: InterviewStatus) => void;
} & InterviewCardActions) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = items.find((i) => i.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) { setActiveId(String(e.active.id)); }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over) return;
    const interview = items.find((i) => i.id === a.id);
    const targetId = String(over.id);
    if (interview && STATUS_SET.includes(targetId) && interview.status !== targetId) {
      onMove(interview, targetId as InterviewStatus);
    }
  }

  if (items.length === 0) {
    return <EmptyState icon="CalendarClock" title="No interviews tracked" description="Log your pipeline from application through offer to see it move through these columns." />;
  }

  return (
    <DndContext id="interview-pipeline" sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="scrollbar-thin grid grid-flow-col grid-rows-1 gap-4 overflow-x-auto pb-3 lg:grid lg:grid-flow-row lg:grid-cols-3 xl:grid-cols-6 lg:overflow-visible">
        {INTERVIEW_STATUSES.map((status) => (
          <DroppableColumn key={status} status={status} items={items.filter((i) => i.status === status)} {...actions} />
        ))}
      </div>
      <DragOverlay>
        {active && (
          <div className="rotate-2">
            <InterviewCard interview={active} dragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
