"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal, MapPin, Wallet, CalendarClock, User, FileText, Gauge,
  Eye, Pencil, NotebookPen, ArrowRightLeft, Trash2, ListChecks,
} from "lucide-react";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate, daysUntil, splitNotes } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface InterviewCardActions {
  onView?: (iv: Interview) => void;
  onEdit?: (iv: Interview) => void;
  onAddNotes?: (iv: Interview) => void;
  onStatusChange?: (iv: Interview, status: InterviewStatus) => void;
  onDelete?: (iv: Interview) => void;
}

export function InterviewCard({ interview, className, dragging, ...actions }: InterviewCardActions & {
  interview: Interview;
  className?: string;
  dragging?: boolean;
}) {
  const { onView, onEdit, onAddNotes, onStatusChange, onDelete } = actions;
  const accent = ACCENT_CLASS[STATUS_ACCENT[interview.status] ?? "slate"];
  const d = daysUntil(interview.interviewDate);
  const notesCount = splitNotes(interview.notes).length;
  const hasMenu = onView || onEdit || onAddNotes || onStatusChange || onDelete;

  return (
    <motion.div
      layout
      className={cn(
        "card-glow group rounded-xl border border-border bg-card p-4 transition-shadow",
        dragging && "opacity-60 shadow-xl ring-2 ring-primary/40",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar name={interview.company} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-tight">{interview.company}</p>
          <p className="truncate text-xs text-muted-foreground">{interview.position}</p>
        </div>
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onView && <DropdownMenuItem onClick={() => onView(interview)}><Eye className="h-4 w-4" /> View</DropdownMenuItem>}
              {onEdit && <DropdownMenuItem onClick={() => onEdit(interview)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>}
              {onAddNotes && <DropdownMenuItem onClick={() => onAddNotes(interview)}><NotebookPen className="h-4 w-4" /> Add notes</DropdownMenuItem>}
              {onStatusChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><ArrowRightLeft className="h-4 w-4" /> Update status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {INTERVIEW_STATUSES.filter((s) => s !== interview.status).map((s) => {
                      const sa = ACCENT_CLASS[STATUS_ACCENT[s] ?? "slate"];
                      return (
                        <DropdownMenuItem key={s} onClick={() => onStatusChange(interview, s)}>
                          <span className={cn("h-2 w-2 rounded-full", sa.dot)} /> {s}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {onDelete && (onView || onEdit || onAddNotes || onStatusChange) && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(interview)} className="text-signal-red focus:text-signal-red">
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {interview.round && (
        <div className="mt-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[0.65rem]", accent.bg, accent.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} /> {interview.round}
          </span>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-1.5 font-mono text-[0.7rem] text-muted-foreground sm:grid-cols-2">
        {interview.location && (
          <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3 shrink-0" /> {interview.location}</p>
        )}
        {interview.salaryRange && (
          <p className="flex items-center gap-1.5 truncate"><Wallet className="h-3 w-3 shrink-0" /> {interview.salaryRange}</p>
        )}
        {interview.recruiter && (
          <p className="flex items-center gap-1.5 truncate"><User className="h-3 w-3 shrink-0" /> {interview.recruiter}</p>
        )}
        {interview.interviewDate && (
          <p className="flex items-center gap-1.5 truncate">
            <CalendarClock className="h-3 w-3 shrink-0" /> {formatDate(interview.interviewDate)}
            {d !== null && d >= 0 && (
              <span className={cn(d === 0 ? "text-signal-red" : d <= 3 ? "text-signal-amber" : "text-muted-foreground/70")}>
                · in {d}d
              </span>
            )}
          </p>
        )}
      </div>

      {(interview.readinessScore !== undefined || notesCount > 0 || interview.roundsTotal) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {interview.readinessScore !== undefined && (
            <Badge variant="muted" className="gap-1"><Gauge className="h-3 w-3" /> {interview.readinessScore}% ready</Badge>
          )}
          {!!interview.roundsTotal && (
            <Badge variant="muted" className="gap-1"><ListChecks className="h-3 w-3" /> {interview.roundsCompleted ?? 0}/{interview.roundsTotal} rounds</Badge>
          )}
          {notesCount > 0 && (
            <Badge variant="muted" className="gap-1"><FileText className="h-3 w-3" /> {notesCount} note{notesCount === 1 ? "" : "s"}</Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}
