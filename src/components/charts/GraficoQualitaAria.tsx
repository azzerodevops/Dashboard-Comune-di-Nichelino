"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type DataPoint = {
  anno: number;
  valore: number;
  conforme: boolean;
};

type Props = {
  data: DataPoint[];
  inquinante: string;
  limite: number;
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 1 });

export default function GraficoQualitaAria({ data, inquinante, limite }: Props) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-slate-400"
        style={{ minHeight: 300 }}
      >
        Nessun dato disponibile
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: 350 }}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="anno"
            tick={{ fill: "#475569", fontSize: 11 }}
            stroke="#cbd5e1"
            tickFormatter={(v) => String(v)}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
            domain={[0, 60]}
            label={{
              value: "µg/m³",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 12,
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
            formatter={(value) => [
              formatNumber(value as number) + " µg/m³",
              inquinante,
            ]}
            labelFormatter={(label) => `Anno ${label}`}
          />
          <ReferenceLine
            y={limite}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{
              value: `Limite: ${limite} µg/m³`,
              fill: "#ef4444",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Bar dataKey="valore" radius={[3, 3, 0, 0]} name={inquinante}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.conforme ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
