"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { PAESC } from "@/lib/constants";

type Props = {
  aggiornamenti: { data: string; tco2_cumulate: number }[];
};

const formatNumber = (v: number) =>
  v.toLocaleString("it-IT", { maximumFractionDigits: 0 });

function buildTargetLine(): { anno: string; tco2_target: number }[] {
  const start = { anno: "2021", tco2_target: PAESC.tco2_ime_2021 as number };
  const end = { anno: "2030", tco2_target: PAESC.tco2_target_2030 as number };
  const points: { anno: string; tco2_target: number }[] = [start];
  for (let y = 2022; y <= 2029; y++) {
    const frac = (y - 2021) / (2030 - 2021);
    points.push({
      anno: String(y),
      tco2_target: Math.round(
        PAESC.tco2_ime_2021 +
          frac * (PAESC.tco2_target_2030 - PAESC.tco2_ime_2021)
      ),
    });
  }
  points.push(end);
  return points;
}

export default function GraficoTrendMonitoraggio({ aggiornamenti }: Props) {
  const targetPoints = buildTargetLine();

  // Merge target line with actual monitoring data
  const mergedMap = new Map<
    string,
    { anno: string; tco2_target?: number; tco2_effettive?: number }
  >();

  for (const tp of targetPoints) {
    mergedMap.set(tp.anno, { anno: tp.anno, tco2_target: tp.tco2_target });
  }

  for (const agg of aggiornamenti) {
    // Extract year from date string (could be YYYY-MM-DD or similar)
    const anno = agg.data.slice(0, 4);
    const tco2_effettive = PAESC.tco2_ime_2021 - agg.tco2_cumulate;
    const existing = mergedMap.get(anno);
    if (existing) {
      existing.tco2_effettive = tco2_effettive;
    } else {
      mergedMap.set(anno, { anno, tco2_effettive });
    }
  }

  const data = Array.from(mergedMap.values()).sort((a, b) =>
    a.anno.localeCompare(b.anno)
  );

  const hasActualData = aggiornamenti.length > 0;

  return (
    <div className="w-full" style={{ minHeight: 400 }}>
      {!hasActualData && (
        <p className="mb-2 text-center text-sm text-slate-400">
          Nessun dato di monitoraggio disponibile
        </p>
      )}
      <ResponsiveContainer width="100%" height={380}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="anno"
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fill: "#475569", fontSize: 12 }}
            stroke="#cbd5e1"
            domain={["auto", "auto"]}
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
              (name as string) === "tco2_target"
                ? "Obiettivo lineare"
                : "Emissioni effettive",
            ]}
            labelFormatter={(label) => `Anno ${label}`}
          />
          <Legend
            formatter={(value) =>
              value === "tco2_target"
                ? "Obiettivo lineare"
                : "Emissioni effettive"
            }
            wrapperStyle={{ color: "#334155" }}
          />
          <ReferenceLine
            y={PAESC.tco2_target_2030}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{
              value: `Target 2030: ${formatNumber(PAESC.tco2_target_2030)} tCO\u2082`,
              fill: "#ef4444",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Line
            type="linear"
            dataKey="tco2_target"
            stroke="#2dd4bf"
            strokeDasharray="8 4"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          {hasActualData && (
            <Line
              type="monotone"
              dataKey="tco2_effettive"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ fill: "#16a34a", r: 4 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
