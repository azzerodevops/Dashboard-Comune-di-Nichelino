"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    anno: number;
    popolazione: number;
    nuclei?: number;
    comp_famiglia?: number;
  }[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 2 });

export default function GraficoDemografia({ data }: Props) {
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
    <div className="w-full" style={{ minHeight: 420 }}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="anno"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            yAxisId="left"
            domain={[44000, 49000]}
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
            label={{
              value: "Popolazione",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 12,
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[2.0, 2.6]}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
            label={{
              value: "Comp./famiglia",
              angle: 90,
              position: "insideRight",
              fill: "#64748b",
              fontSize: 12,
              offset: -5,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              color: "#1e293b",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => {
              if ((name as string) === "Componenti/famiglia")
                return [(value as number).toFixed(2), name];
              return [formatNumber(value as number), name];
            }}
          />
          <Legend
            wrapperStyle={{ color: "#334155", fontSize: 12 }}
            iconType="circle"
          />
          <Bar
            yAxisId="left"
            dataKey="popolazione"
            name="Popolazione"
            fill="#5eead4"
            radius={[4, 4, 0, 0]}
            barSize={18}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="comp_famiglia"
            name="Componenti/famiglia"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
