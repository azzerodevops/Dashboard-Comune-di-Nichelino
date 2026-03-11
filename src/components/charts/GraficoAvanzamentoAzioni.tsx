"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Props = {
  data: {
    macrotema: string;
    completate: number;
    in_corso: number;
    pianificate: number;
    sospese: number;
  }[];
};

const COLORS = {
  completate: "#22c55e",
  in_corso: "#0d9488",
  pianificate: "#6b7280",
  sospese: "#eab308",
} as const;

const LABELS: Record<string, string> = {
  completate: "Completate",
  in_corso: "In corso",
  pianificate: "Pianificate",
  sospese: "Sospese",
};

export default function GraficoAvanzamentoAzioni({ data }: Props) {
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

  return (
    <div className="w-full" style={{ minHeight: 400 }}>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="macrotema"
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              color: "#1e293b",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => [
              value as number,
              LABELS[name as string] ?? name,
            ]}
          />
          <Legend
            formatter={(value) => LABELS[value] ?? value}
            wrapperStyle={{ color: "#334155" }}
          />
          <Bar
            dataKey="completate"
            stackId="a"
            fill={COLORS.completate}
            name="completate"
          />
          <Bar
            dataKey="in_corso"
            stackId="a"
            fill={COLORS.in_corso}
            name="in_corso"
          />
          <Bar
            dataKey="pianificate"
            stackId="a"
            fill={COLORS.pianificate}
            name="pianificate"
          />
          <Bar
            dataKey="sospese"
            stackId="a"
            fill={COLORS.sospese}
            name="sospese"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
