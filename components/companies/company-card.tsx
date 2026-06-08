"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import type { CompanyPrep } from "@/types";
import { CompanyAvatar } from "@/components/interviews/company-avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function CompanyCard({ company, index }: { company: CompanyPrep; index: number }) {
  const total = company.checklist.length;
  const done = company.checklist.filter((c) => c.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/companies/${company.slug}`}
        className="card-glow block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
      >
        <div className="flex items-start gap-3">
          <CompanyAvatar name={company.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold tracking-tight">{company.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{company.industry}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {company.focusAreas.map((area) => (
            <Badge key={area} variant="outline" className="text-muted-foreground">{area}</Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground tabular-nums">
            <ListChecks className="h-3.5 w-3.5" /> {done}/{total} prep
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
