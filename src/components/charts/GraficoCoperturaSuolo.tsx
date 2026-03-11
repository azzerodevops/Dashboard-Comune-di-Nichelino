"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  CORINE LAND COVER DONUT CHART                                      */
/* ------------------------------------------------------------------ */

const CORINE_CHART_DATA = [
  { name: "Tessuto urbano discontinuo", value: 465.54, color: "#a855f7" },
  { name: "Zone industriali/commerciali", value: 262.23, color: "#ec4899" },
  { name: "Cantieri", value: 24.97, color: "#f97316" },
  { name: "Aree verdi urbane", value: 332.25, color: "#22c55e" },
  { name: "Seminativi non irrigui", value: 447.47, color: "#eab308" },
  { name: "Sistemi colturali complessi", value: 247.34, color: "#84cc16" },
  { name: "Aree agricole con spazi naturali", value: 6.49, color: "#a3e635" },
  { name: "Boschi di latifoglie", value: 274.31, color: "#059669" },
];

const TOTAL_HA = 2060.6;

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderDonutLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
    cx: number; cy: number; midAngle: number;
    innerRadius: number; outerRadius: number; percent: number;
  };
  const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.03) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#334155"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const pct = ((d.value / TOTAL_HA) * 100).toFixed(2);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{d.name}</p>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-bold text-slate-800">
          {d.value.toLocaleString("it-IT", { minimumFractionDigits: 2 })} ha
        </span>{" "}
        ({pct}%)
      </p>
    </div>
  );
}

export function GraficoCoperturaSuolo() {
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={380}>
        <PieChart>
          <Pie
            data={CORINE_CHART_DATA}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            label={renderDonutLabel}
            labelLine={false}
          >
            {CORINE_CHART_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={10}
            formatter={(value: string) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
            wrapperStyle={{ paddingTop: 16 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BUILDING CONSTRUCTION PERIOD BAR CHART                             */
/* ------------------------------------------------------------------ */

const EPOCHE_CHART_DATA = [
  { epoca: "< 1919", percentuale: 2.1 },
  { epoca: "1919-45", percentuale: 3.4 },
  { epoca: "1946-60", percentuale: 18.7 },
  { epoca: "1961-70", percentuale: 30.8 },
  { epoca: "1971-80", percentuale: 20.7 },
  { epoca: "1981-90", percentuale: 10.9 },
  { epoca: "1991-00", percentuale: 7.2 },
  { epoca: "2001-11", percentuale: 6.2 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-bold text-slate-800">{payload[0].value}%</span> degli edifici
      </p>
    </div>
  );
}

export function GraficoEpocheCostruzione() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={EPOCHE_CHART_DATA}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="epoca"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<BarTooltip />} />
        <Bar
          dataKey="percentuale"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        >
          {EPOCHE_CHART_DATA.map((entry, index) => {
            const isHighlight = entry.percentuale > 15;
            return (
              <Cell
                key={`bar-${index}`}
                fill={isHighlight ? "#f43f5e" : "#94a3b8"}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  EROSION DONUT CHART                                                */
/* ------------------------------------------------------------------ */

const EROSIONE_CHART_DATA = [
  { name: "Molto bassa (<2 t/ha/a)", value: 45, color: "#22c55e" },
  { name: "Bassa (2-5 t/ha/a)", value: 17, color: "#84cc16" },
  { name: "Media (5-8 t/ha/a)", value: 15, color: "#eab308" },
  { name: "Alta (8-12 t/ha/a)", value: 13, color: "#f97316" },
  { name: "Molto alta (>12 t/ha/a)", value: 10, color: "#ef4444" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ErosioneTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{d.name}</p>
      <p className="mt-1 text-sm text-slate-600">
        ~<span className="font-bold text-slate-800">{d.value}%</span> del territorio
      </p>
    </div>
  );
}

export function GraficoErosione() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={EROSIONE_CHART_DATA}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ percent }: { percent?: number }) => (percent ?? 0) > 0.08 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""}
          labelLine={false}
        >
          {EROSIONE_CHART_DATA.map((entry, index) => (
            <Cell key={`ero-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<ErosioneTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={10}
          formatter={(value: string) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
