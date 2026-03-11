"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

type DataPoint = {
  anno: number;
  su25: number;
  su30: number;
  txx: number;
  wsdi: number;
};

type Props = {
  data: DataPoint[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 1 });

const LEGEND_MAP: Record<string, string> = {
  su30: "SU30 (gg T max > 30°C)",
  txx: "TXx (°C max assoluta)",
  wsdi: "WSDI (gg consecutivi)",
};

export default function GraficoTemperature({ data }: Props) {
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
    <div className="w-full" style={{ minHeight: 450 }}>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="anno"
            tick={{ fill: "#475569", fontSize: 11 }}
            stroke="#cbd5e1"
            tickFormatter={(v) => String(v)}
          />
          {/* Left Y axis: days (SU30, WSDI) */}
          <YAxis
            yAxisId="left"
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
            label={{
              value: "Giorni",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 12,
            }}
          />
          {/* Right Y axis: temperature (TXx) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[30, 45]}
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
            label={{
              value: "°C",
              angle: 90,
              position: "insideRight",
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
            formatter={(value, name) => {
              const label = LEGEND_MAP[name as string] ?? name;
              if (name === "txx")
                return [formatNumber(value as number) + " °C", label];
              return [formatNumber(value as number) + " gg", label];
            }}
            labelFormatter={(label) => `Anno ${label}`}
          />
          <Legend
            formatter={(value) => LEGEND_MAP[value as string] ?? value}
            wrapperStyle={{ color: "#334155", fontSize: 12 }}
          />
          <ReferenceLine
            yAxisId="right"
            y={40}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{
              value: "40°C",
              fill: "#ef4444",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="su30"
            fill="#fbbf24"
            opacity={0.7}
            radius={[2, 2, 0, 0]}
            name="su30"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="txx"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 3 }}
            name="txx"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wsdi"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ fill: "#a855f7", r: 3 }}
            name="wsdi"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
