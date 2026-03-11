import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  PAESC,
  CONFRONTO_SETTORI,
  MACROTEMI_COLORS,
} from "@/lib/constants";
import { formatNumber, cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingDown,
  Target,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Clock,
  PauseCircle,
  FileText,
  Activity,
} from "lucide-react";
import type {
  Macrotema,
  AzioneMitigazione,
  AggiornamentoMitigazione,
  AzioneAdattamento,
  AggiornamentoAdattamento,
} from "@/lib/supabase/types";
import GraficoRiduzionePerMacrotema from "@/components/charts/GraficoRiduzionePerMacrotema";
import GraficoTrendMonitoraggio from "@/components/charts/GraficoTrendMonitoraggio";
import GraficoAvanzamentoAzioni from "@/components/charts/GraficoAvanzamentoAzioni";
import GraficoConfrontoSettori from "@/components/charts/GraficoConfrontoSettori";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Data fetching ───────────────────────────────────────────────────
async function fetchDashboardData() {
  const supabase = await createClient();

  const [
    { data: macrotemi },
    { data: azioniMit },
    { data: aggiornamenti },
    { data: azioniAd },
    { data: aggAd },
  ] = await Promise.all([
    supabase.from("macrotemi").select("*").order("numero"),
    supabase.from("azioni_mitigazione").select("*"),
    supabase
      .from("aggiornamenti_mitigazione")
      .select("*")
      .order("data_aggiornamento", { ascending: false }),
    supabase.from("azioni_adattamento").select("*"),
    supabase
      .from("aggiornamenti_adattamento")
      .select("*")
      .order("data_aggiornamento", { ascending: false }),
  ]);

  return {
    macrotemi: (macrotemi ?? []) as Macrotema[],
    azioniMit: (azioniMit ?? []) as AzioneMitigazione[],
    aggiornamenti: (aggiornamenti ?? []) as AggiornamentoMitigazione[],
    azioniAd: (azioniAd ?? []) as AzioneAdattamento[],
    aggAd: (aggAd ?? []) as AggiornamentoAdattamento[],
  };
}

// ── Helpers ─────────────────────────────────────────────────────────
function getLatestStatus(
  azioneId: string,
  aggiornamenti: (AggiornamentoMitigazione | AggiornamentoAdattamento)[]
) {
  return aggiornamenti.find((a) => a.azione_id === azioneId);
}

function countByStatus(
  azioni: { id: string }[],
  aggiornamenti: (AggiornamentoMitigazione | AggiornamentoAdattamento)[]
) {
  const counts = { pianificate: 0, in_corso: 0, completate: 0, sospese: 0 };
  for (const az of azioni) {
    const latest = getLatestStatus(az.id, aggiornamenti);
    const stato = latest?.stato ?? "pianificato";
    if (stato === "pianificato") counts.pianificate++;
    else if (stato === "in_corso") counts.in_corso++;
    else if (stato === "completato") counts.completate++;
    else if (stato === "sospeso") counts.sospese++;
  }
  return counts;
}

// ── Page ────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const { macrotemi, azioniMit, aggiornamenti, azioniAd, aggAd } =
    await fetchDashboardData();

  // Compute mitigation status counts
  const mitCounts = countByStatus(azioniMit, aggiornamenti);
  const adCounts = countByStatus(azioniAd, aggAd);

  // Build chart data for GraficoAvanzamentoAzioni
  const avanzamentoByMacrotema = macrotemi.map((m) => {
    const azioniDelMacrotema = azioniMit.filter(
      (a) => a.macrotema_id === m.id
    );
    const counts = countByStatus(azioniDelMacrotema, aggiornamenti);
    return {
      macrotema: m.label,
      completate: counts.completate,
      in_corso: counts.in_corso,
      pianificate: counts.pianificate,
      sospese: counts.sospese,
    };
  });

  // Build trend data for GraficoTrendMonitoraggio
  const trendMap = new Map<string, number>();
  for (const agg of aggiornamenti) {
    if (agg.tco2_effettive != null && agg.tco2_effettive > 0) {
      const year = agg.data_aggiornamento.slice(0, 4);
      trendMap.set(year, (trendMap.get(year) ?? 0) + agg.tco2_effettive);
    }
  }
  const trendData = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<{ data: string; tco2_cumulate: number }[]>((acc, [year, val]) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].tco2_cumulate : 0;
      acc.push({ data: year, tco2_cumulate: prev + val });
      return acc;
    }, []);

  // Build data for GraficoRiduzionePerMacrotema
  const riduzioneData = macrotemi.map((m) => {
    const azioniDelMacrotema = azioniMit.filter(
      (a) => a.macrotema_id === m.id
    );
    let tco2Eff = 0;
    for (const az of azioniDelMacrotema) {
      const latest = getLatestStatus(az.id, aggiornamenti);
      if (latest && (latest as AggiornamentoMitigazione).tco2_effettive) {
        tco2Eff += (latest as AggiornamentoMitigazione).tco2_effettive!;
      }
    }
    return {
      label: m.label,
      colore: m.colore,
      tco2_previste: m.tco2_previste,
      tco2_effettive: tco2Eff,
    };
  });

  // Macrotemi enriched with action counts
  const macrotemiEnriched = macrotemi.map((m) => {
    const azioniDelMacrotema = azioniMit.filter(
      (a) => a.macrotema_id === m.id
    );
    const counts = countByStatus(azioniDelMacrotema, aggiornamenti);
    return {
      ...m,
      numAzioni: azioniDelMacrotema.length,
      completate: counts.completate,
      in_corso: counts.in_corso,
      totale: azioniDelMacrotema.length,
    };
  });

  // Percentages for progress bar
  const ridGiaConseguita = 18.4;
  const ridPianificata = 37.3;
  const ridTotale = 55.7;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── 1. Page Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Panoramica Strategica
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Stato di avanzamento del PAESC Nichelino 2030
        </p>
      </div>

      {/* ── 2. KPI Strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<BarChart3 className="h-5 w-5 text-gray-400" />}
          label="IBE 2000"
          value={formatNumber(PAESC.tco2_ibe_2000)}
          unit="tCO&#8322;"
        />
        <KpiCard
          icon={<TrendingDown className="h-5 w-5 text-blue-500" />}
          label="IME 2021"
          value={formatNumber(PAESC.tco2_ime_2021)}
          unit="tCO&#8322;"
          badge={{ text: "-18,4%", color: "bg-blue-50 text-blue-700" }}
        />
        <KpiCard
          icon={<Target className="h-5 w-5 text-amber-500" />}
          label="Target 2030"
          value={formatNumber(PAESC.tco2_target_2030)}
          unit="tCO&#8322;"
          badge={{ text: "-40%", color: "bg-amber-50 text-amber-700" }}
        />
        <KpiCard
          icon={<Leaf className="h-5 w-5 text-emerald-500" />}
          label="Previsto 2030"
          value={formatNumber(PAESC.tco2_attese_2030)}
          unit="tCO&#8322;"
          badge={{ text: "-55,7%", color: "bg-emerald-50 text-emerald-700" }}
        />
      </div>

      {/* ── 3. Emissions Progress ───────────────────────────────────── */}
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Percorso di Riduzione Emissioni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative h-5 w-full overflow-hidden rounded-full bg-gray-100">
              {/* Already achieved */}
              <div
                className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500 transition-all"
                style={{ width: `${(ridGiaConseguita / 100) * 100}%` }}
              />
              {/* Planned additional */}
              <div
                className="absolute inset-y-0 rounded-r-full bg-emerald-200 transition-all"
                style={{
                  left: `${(ridGiaConseguita / 100) * 100}%`,
                  width: `${(ridPianificata / 100) * 100}%`,
                }}
              />
              {/* Target marker */}
              <div
                className="absolute inset-y-0 w-0.5 bg-amber-500"
                style={{ left: `${(40 / 100) * 100}%` }}
              />
              <div
                className="absolute -top-6 text-xs font-medium text-amber-600"
                style={{
                  left: `${(40 / 100) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                Target -40%
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                Riduzione conseguita: {ridGiaConseguita}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-200" />
                Riduzione pianificata: {ridPianificata}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                Target PAESC: 40%
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-500">
            Le emissioni sono gia diminuite del <strong className="text-gray-700">18,4%</strong> rispetto
            al 2000. Con le azioni pianificate si prevede una riduzione complessiva del{" "}
            <strong className="text-emerald-700">55,7%</strong>, superando
            l&apos;obiettivo del 40% fissato dal PAESC.
          </p>
        </CardContent>
      </Card>

      {/* ── 4. Charts in Tabs ───────────────────────────────────────── */}
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue={0}>
            <div className="border-b border-gray-100 px-6 pt-4">
              <TabsList variant="line">
                <TabsTrigger value={0} className="text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Emissioni
                </TabsTrigger>
                <TabsTrigger value={1} className="text-sm">
                  <Activity className="h-4 w-4" />
                  Monitoraggio
                </TabsTrigger>
                <TabsTrigger value={2} className="text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Azioni
                </TabsTrigger>
                <TabsTrigger value={3} className="text-sm">
                  <TrendingDown className="h-4 w-4" />
                  Riduzione
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={0} className="p-6">
              <div className="h-[400px]">
                <GraficoConfrontoSettori
                  data={CONFRONTO_SETTORI.map((s) => ({
                    settore: s.settore,
                    ibe2000: s.ibe2000,
                    ime2021: s.ime2021,
                    delta_pct: s.delta_pct,
                  }))}
                />
              </div>
            </TabsContent>

            <TabsContent value={1} className="p-6">
              <div className="h-[400px]">
                <GraficoTrendMonitoraggio aggiornamenti={trendData} />
              </div>
            </TabsContent>

            <TabsContent value={2} className="p-6">
              <div className="h-[400px]">
                <GraficoAvanzamentoAzioni data={avanzamentoByMacrotema} />
              </div>
            </TabsContent>

            <TabsContent value={3} className="p-6">
              <div className="h-[400px]">
                <GraficoRiduzionePerMacrotema macrotemi={riduzioneData} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── 5. Actions Status ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActionsSummaryCard
          title="Mitigazione"
          total={azioniMit.length}
          counts={mitCounts}
          href="/dashboard/mitigazione"
        />
        <ActionsSummaryCard
          title="Adattamento"
          total={azioniAd.length}
          counts={adCounts}
          href="/dashboard/adattamento"
        />
      </div>

      {/* ── 6. Macrotemi Progress ───────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Avanzamento per Macrotema
        </h2>
        {macrotemiEnriched.length === 0 ? (
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-400">
                Nessun macrotema disponibile. I dati saranno visibili dopo il primo inserimento nel database.
              </p>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {macrotemiEnriched.map((m) => {
            const progressPct =
              m.totale > 0
                ? Math.round(
                    ((m.completate + m.in_corso * 0.5) / m.totale) * 100
                  )
                : 0;
            return (
              <Card
                key={m.id}
                className="flex overflow-hidden rounded-2xl border-gray-200 shadow-sm"
              >
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: m.colore }}
                />
                <CardContent className="flex-1 space-y-2 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {m.label}
                  </p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold text-gray-700">
                      {formatNumber(m.tco2_previste)}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        tCO&#8322;
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {m.numAzioni} azioni
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: m.colore,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {m.completate} completate, {m.in_corso} in corso
                    </span>
                    <span>{progressPct}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  unit,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  badge?: { text: string; color: string };
}) {
  return (
    <Card className="rounded-2xl border-gray-200 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
            {icon}
          </div>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                badge.color
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            {unit} &middot; {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_CONFIG = {
  pianificate: {
    label: "Pianificate",
    icon: FileText,
    color: "bg-gray-100 text-gray-700",
  },
  in_corso: {
    label: "In corso",
    icon: Clock,
    color: "bg-blue-50 text-blue-700",
  },
  completate: {
    label: "Completate",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
  },
  sospese: {
    label: "Sospese",
    icon: PauseCircle,
    color: "bg-amber-50 text-amber-700",
  },
} as const;

function ActionsSummaryCard({
  title,
  total,
  counts,
  href,
}: {
  title: string;
  total: number;
  counts: { pianificate: number; in_corso: number; completate: number; sospese: number };
  href: string;
}) {
  return (
    <Card className="rounded-2xl border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">
            {title}
          </CardTitle>
          <span className="text-sm text-gray-400">{total} azioni</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(
            Object.entries(counts) as [keyof typeof STATUS_CONFIG, number][]
          ).map(([key, count]) => {
            const config = STATUS_CONFIG[key];
            const Icon = config.icon;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2",
                  config.color
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-tight">{count}</p>
                  <p className="truncate text-xs">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Vedi dettaglio
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
