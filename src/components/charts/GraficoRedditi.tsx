"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

type Props = {
  data: { comune: string; reddito: number }[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 0 });

export default function GraficoRedditi({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-slate-400"
        style={{ minHeight: 350 }}
      >
        Nessun dato disponibile
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.reddito - a.reddito);
  const media = Math.round(
    sorted.reduce((s, d) => s + d.reddito, 0) / sorted.length
  );

  return (
    <div className="w-full" style={{ minHeight: 500 }}>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[15000, 22000]}
            tickFormatter={(v) => formatNumber(v) + " €"}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            type="category"
            dataKey="comune"
            width={130}
            tick={{ fill: "#334155", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              color: "#1e293b",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [formatNumber(value as number) + " €/anno", "Reddito pro-capite"]}
            cursor={{ fill: "#f1f5f9" }}
          />
          <ReferenceLine
            x={media}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: `Media: ${formatNumber(media)} €`,
              position: "top",
              fill: "#64748b",
              fontSize: 12,
            }}
          />
          <Bar dataKey="reddito" radius={[0, 4, 4, 0]} barSize={22}>
            {sorted.map((entry) => (
              <Cell
                key={entry.comune}
                fill={entry.comune === "Nichelino" ? "#dc2626" : "#5eead4"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
