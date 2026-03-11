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
  Cell,
  LabelList,
} from "recharts";

type DataPoint = {
  settore: string;
  ibe2000: number;
  ime2021: number;
  delta_pct: number;
};

type Props = {
  data: DataPoint[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 0 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DeltaLabel(props: any) {
  const { x, y, width, value, index, data } = props as {
    x: number;
    y: number;
    width: number;
    value: number;
    index: number;
    data: DataPoint[];
  };
  const delta = data[index]?.delta_pct;
  if (delta == null) return null;
  const sign = delta >= 0 ? "+" : "";
  const color = delta >= 0 ? "#ef4444" : "#22c55e";
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={color}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {sign}{delta.toFixed(1)}%
    </text>
  );
}

export default function GraficoConfrontoSettori({ data }: Props) {
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
        <BarChart
          data={data}
          margin={{ top: 30, right: 20, left: 20, bottom: 5 }}
          barGap={4}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="settore"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => formatNumber(v)}
            label={{
              value: "tCO\u2082",
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
            formatter={(value, name) => [
              formatNumber(value as number) + " tCO\u2082",
              (name as string) === "ibe2000" ? "IBE 2000" : "IME 2021",
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ color: "#334155", fontSize: 12 }}
            formatter={(value) =>
              value === "ibe2000" ? "IBE 2000" : "IME 2021"
            }
          />
          <Bar dataKey="ibe2000" fill="#5eead4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ime2021" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.settore === "Terziario" ? "#ef4444" : "#0d9488"}
              />
            ))}
            <LabelList
              dataKey="ime2021"
              position="top"
              content={(props) => (
                <DeltaLabel {...props} data={data} />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
