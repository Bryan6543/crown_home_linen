"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function VisitChart({ data }: { data: { date: string; views: number; clicks: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
          <Tooltip />
          <Bar dataKey="views" fill="#1c1916" name="Visits" />
          <Bar dataKey="clicks" fill="#8d6b3e" name="Clicks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
