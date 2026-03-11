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
} from "recharts";

type MacrotemaRow = {
  label: string;
  colore: string;
  tco2_previste: number;
  tco2_effettive: number;
};

type Props = {
  macrotemi: MacrotemaRow[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 0 });

/** Lighten a hex color by mixing with white */
function lighten(hex: string, amount = 0.4): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

export default function GraficoRiduzionePerMacrotema({ macrotemi }: Props) {
  if (!macrotemi || macrotemi.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-slate-400"
        style={{ minHeight: 350 }}
      >
        Nessun dato disponibile
      </div>
    );
  }

  const data = macrotemi.map((m) => ({
    ...m,
    colore_light: lighten(m.colore, 0.4),
  }));

  return (
    <div className="w-full" style={{ minHeight: 400 }}>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tickFormatter={formatNumber}
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
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
              formatNumber(value as number) + " tCO\u2082",
              (name as string) === "tco2_previste"
                ? "Previste (target)"
                : "Effettive (attuale)",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "tco2_previste"
                ? "Previste (target)"
                : "Effettive (attuale)"
            }
            wrapperStyle={{ color: "#334155" }}
          />
          <Bar dataKey="tco2_previste" name="tco2_previste" barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`prev-${index}`} fill={entry.colore_light} />
            ))}
          </Bar>
          <Bar dataKey="tco2_effettive" name="tco2_effettive" barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`eff-${index}`} fill={entry.colore} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
