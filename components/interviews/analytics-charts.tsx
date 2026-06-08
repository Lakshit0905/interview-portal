"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart, LabelList,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { InterviewInsights } from "@/lib/data/interview-insights";

const HEX = { blue: "#3B82F6", violet: "#8B5CF6", green: "#10B981", amber: "#F59E0B", red: "#EF4444" };
const PIE_COLORS = [HEX.blue, HEX.violet, HEX.green, HEX.amber, HEX.red, "#64748B"];
const FUNNEL_COLORS = [HEX.blue, "#60A5FA", HEX.violet, HEX.amber, HEX.green];
const GRID = "hsl(var(--border))";
const TICK = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

interface TooltipPayloadItem { name?: string; value?: number; color?: string; fill?: string; payload?: { name?: string } }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      {label && <p className="mb-1 font-mono text-[0.65rem] text-muted-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.fill }} />
          {p.name ?? p.payload?.name}: <span className="font-mono tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function ChartPanel({ title, subtitle, children, index }: { title: string; subtitle?: string; children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="card-glow rounded-xl border border-border bg-card p-5"
    >
      <div className="mb-4">
        <h3 className="font-medium">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function AnalyticsCharts({ analytics }: { analytics: InterviewInsights["analytics"] }) {
  const { applicationsPerMonth, successByRound, funnel, companyDistribution } = analytics;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartPanel title="Applications per month" subtitle="New applications logged, last 6 months" index={0}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationsPerMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="apm-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={HEX.blue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={HEX.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID }} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke={HEX.blue} strokeWidth={2} fill="url(#apm-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="Interview success rate" subtitle="Advancement rate between pipeline stages" index={1}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={successByRound} margin={{ top: 4, right: 8, left: -20, bottom: 24 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} interval={0}
                angle={-18} textAnchor="end" height={50} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
              <Bar dataKey="rate" name="Advancement %" fill={HEX.violet} radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="Offer conversion funnel" subtitle="Candidates reaching each pipeline stage" index={2}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip content={<ChartTooltip />} />
              <Funnel dataKey="count" data={funnel} nameKey="stage" isAnimationActive>
                <LabelList position="right" dataKey="stage" fill="hsl(var(--muted-foreground))" stroke="none" fontSize={11} offset={12} />
                <LabelList position="center" dataKey="count" fill="#fff" stroke="none" fontSize={13} fontWeight={600} />
                {funnel.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="Company distribution" subtitle="Applications grouped by company" index={3}>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie data={companyDistribution} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={3} strokeWidth={0}>
                {companyDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {companyDistribution.slice(0, 6).map((c, i) => (
            <span key={c.name} className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              {c.name} <span className="text-foreground/70">({c.value})</span>
            </span>
          ))}
        </div>
      </ChartPanel>
    </div>
  );
}
