"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { CodingDashboardStats } from "@/lib/coding-stats";

const NEON_BLUE = "hsl(217, 91%, 60%)";
const NEON_PURPLE = "hsl(270, 91%, 65%)";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "hsl(152, 76%, 50%)", Medium: "hsl(38, 95%, 58%)", Hard: "hsl(0, 80%, 64%)",
};

const TOPIC_COLORS = [
  NEON_BLUE, NEON_PURPLE, "hsl(152, 76%, 50%)", "hsl(38, 95%, 58%)",
  "hsl(0, 80%, 64%)", "hsl(190, 90%, 60%)", "hsl(330, 80%, 65%)", "hsl(50, 90%, 60%)", "hsl(215, 16%, 65%)",
];

const tooltipStyle = {
  background: "hsl(222, 28%, 9%)",
  border: "1px solid hsl(0, 0%, 100%, 0.1)",
  borderRadius: 8,
  fontSize: 12,
};

export function ProgressCharts({ stats }: { stats: CodingDashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass-card p-5">
        <h3 className="mono-label mb-4">Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={stats.progressOverTime}>
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={NEON_BLUE} stopOpacity={0.5} />
                <stop offset="100%" stopColor={NEON_PURPLE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => d} />
            <Area type="monotone" dataKey="total" name="Solved" stroke={NEON_BLUE} fill="url(#progressFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-5">
        <h3 className="mono-label mb-4">Solved by Difficulty</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.difficultyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 100%, 0.06)" vertical={false} />
            <XAxis dataKey="difficulty" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(0, 0%, 100%, 0.04)" }} />
            <Bar dataKey="count" name="Solved" radius={[6, 6, 0, 0]}>
              {stats.difficultyDistribution.map((d) => (
                <Cell key={d.difficulty} fill={DIFFICULTY_COLOR[d.difficulty]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-5">
        <h3 className="mono-label mb-4">Topic Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie data={stats.topicDistribution} dataKey="count" nameKey="topic" innerRadius={42} outerRadius={70} paddingAngle={2}>
              {stats.topicDistribution.map((t, i) => (
                <Cell key={t.topic} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
