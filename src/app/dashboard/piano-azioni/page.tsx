import { createClient } from "@/lib/supabase/server";
import { STATI_AZIONE, MACROTEMI_COLORS, PAESC } from "@/lib/constants";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  getStatoColor,
  cn,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  ClipboardList,
  Shield,
  CheckCircle2,
  Clock,
  CalendarClock,
  Pause,
  Euro,
  TrendingDown,
  Target,
  Leaf,
  Info,
} from "lucide-react";
import type {
  Macrotema,
  AzioneMitigazione,
  AzioneAdattamento,
  AggiornamentoMitigazione,
  AggiornamentoAdattamento,
} from "@/lib/supabase/types";

// ── Helpers ────────────────────────────────────────────────────────────

function getStatoLabel(stato: string): string {
  const found = STATI_AZIONE.find((s) => s.value === stato);
  return found ? found.label : stato;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Predominant status among a set of azioni */
function getStatoPredominante(
  azioniIds: string[],
  latestMap: Map<string, { stato: string }>
): string {
  const counts: Record<string, number> = {
    completato: 0,
    in_corso: 0,
    pianificato: 0,
    sospeso: 0,
  };
  for (const id of azioniIds) {
    const stato = latestMap.get(id)?.stato ?? "pianificato";
    if (stato in counts) counts[stato]++;
  }
  let max = 0;
  let predominante = "pianificato";
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      predominante = k;
    }
  }
  return predominante;
}

// ── Data fetching ──────────────────────────────────────────────────────

async function fetchData() {
  const supabase = await createClient();

  const [
    { data: macrotemi },
    { data: azioniMitRaw },
    { data: azioniAdaRaw },
    { data: aggMitRaw },
    { data: aggAdaRaw },
  ] = await Promise.all([
    supabase.from("macrotemi").select("*").order("numero"),
    supabase
      .from("azioni_mitigazione")
      .select("*")
      .order("macrotema_id")
      .order("id"),
    supabase.from("azioni_adattamento").select("*").order("id"),
    supabase
      .from("aggiornamenti_mitigazione")
      .select("*")
      .order("data_aggiornamento", { ascending: false }),
    supabase
      .from("aggiornamenti_adattamento")
      .select("*")
      .order("data_aggiornamento", { ascending: false }),
  ]);

  const macrotemiList = (macrotemi ?? []) as Macrotema[];
  const azioniMit = (azioniMitRaw ?? []) as AzioneMitigazione[];
  const azioniAda = (azioniAdaRaw ?? []) as AzioneAdattamento[];
  const aggMit = (aggMitRaw ?? []) as AggiornamentoMitigazione[];
  const aggAda = (aggAdaRaw ?? []) as AggiornamentoAdattamento[];

  const latestMitMap = new Map<string, AggiornamentoMitigazione>();
  for (const a of aggMit) {
    if (!latestMitMap.has(a.azione_id)) latestMitMap.set(a.azione_id, a);
  }

  const latestAdaMap = new Map<string, AggiornamentoAdattamento>();
  for (const a of aggAda) {
    if (!latestAdaMap.has(a.azione_id)) latestAdaMap.set(a.azione_id, a);
  }

  const macroMap = new Map<string, Macrotema>();
  for (const m of macrotemiList) macroMap.set(m.id, m);

  return {
    macrotemiList,
    azioniMit,
    azioniAda,
    latestMitMap,
    latestAdaMap,
    macroMap,
  };
}

// ── Pericoli color mapping ─────────────────────────────────────────────

const PERICOLI_COLORS: Record<string, string> = {
  alluvioni: "bg-teal-100 text-teal-800",
  ondate_calore: "bg-red-100 text-red-800",
  siccita: "bg-amber-100 text-amber-800",
  frane: "bg-orange-100 text-orange-800",
  tempeste: "bg-indigo-100 text-indigo-800",
  incendi: "bg-rose-100 text-rose-800",
  default: "bg-slate-100 text-slate-700",
};

function getPericoloColor(pericolo: string): string {
  const key = pericolo
    .toLowerCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const [k, v] of Object.entries(PERICOLI_COLORS)) {
    if (key.includes(k)) return v;
  }
  return PERICOLI_COLORS.default;
}

// ── Page Component ─────────────────────────────────────────────────────

export default async function PianoAzioniPage() {
  const {
    macrotemiList,
    azioniMit,
    azioniAda,
    latestMitMap,
    latestAdaMap,
    macroMap,
  } = await fetchData();

  // ── KPI counts ───────────────────────────────────────────────────────
  const statiCombined = {
    pianificato: 0,
    in_corso: 0,
    completato: 0,
    sospeso: 0,
  };

  for (const az of azioniMit) {
    const agg = latestMitMap.get(az.id);
    const stato = agg?.stato ?? "pianificato";
    if (stato in statiCombined)
      statiCombined[stato as keyof typeof statiCombined]++;
  }

  for (const az of azioniAda) {
    const agg = latestAdaMap.get(az.id);
    const stato = agg?.stato ?? "pianificato";
    if (stato in statiCombined)
      statiCombined[stato as keyof typeof statiCombined]++;
  }

  // ── Investimenti ─────────────────────────────────────────────────────
  const investimentoPrevisto = macrotemiList.reduce(
    (sum, m) => sum + (m.investimento_previsto ?? 0),
    0
  );

  const investimentoEffettivoMit = Array.from(latestMitMap.values()).reduce(
    (sum, a) => sum + (a.investimento_effettivo ?? 0),
    0
  );

  const investimentoEffettivoAda = Array.from(latestAdaMap.values()).reduce(
    (sum, a) => sum + (a.investimento_effettivo ?? 0),
    0
  );

  const investimentoEffettivoTotale =
    investimentoEffettivoMit + investimentoEffettivoAda;

  const deltaInvestimento =
    investimentoPrevisto > 0
      ? investimentoEffettivoTotale - investimentoPrevisto
      : null;

  // ── Macrotemi summary ────────────────────────────────────────────────
  const macrotemiSummary = macrotemiList.map((m) => {
    const azioni = azioniMit.filter((a) => a.macrotema_id === m.id);
    const azioniIds = azioni.map((a) => a.id);
    const tco2 = azioni.reduce((s, a) => s + (a.tco2_previste ?? 0), 0);
    const statoPredominante = getStatoPredominante(
      azioniIds,
      latestMitMap as Map<string, { stato: string }>
    );
    return {
      ...m,
      nAzioni: azioni.length,
      tco2Previste: tco2,
      statoPredominante,
    };
  });

  const totalTco2Macrotemi = macrotemiSummary.reduce(
    (s, m) => s + m.tco2Previste,
    0
  );

  // ── Total tCO2 for mitigazione table ─────────────────────────────────
  const totalTco2PrevisteMit = azioniMit.reduce(
    (s, a) => s + (a.tco2_previste ?? 0),
    0
  );
  const totalTco2EffettiveMit = azioniMit.reduce((s, a) => {
    const agg = latestMitMap.get(a.id);
    return s + (agg?.tco2_effettive ?? 0);
  }, 0);

  // ── Investimento per macrotema (for section 6) ───────────────────────
  const investimentoPerMacrotema = macrotemiList.map((m) => ({
    label: m.label,
    colore:
      MACROTEMI_COLORS[m.label.toLowerCase()] ?? m.colore ?? "#6b7280",
    investimentoPrevisto: m.investimento_previsto ?? 0,
  }));

  // ── KPI card config (Row 1 + Row 2) ──────────────────────────────────
  const kpiRow1 = [
    {
      title: "Totale azioni mitigazione",
      value: "33",
      icon: ClipboardList,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "Totale azioni adattamento",
      value: "13",
      icon: Shield,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      title: "Riduzione prevista",
      value: formatNumber(PAESC.riduzione_prevista_totale) + " tCO\u2082/a",
      icon: TrendingDown,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Investimento",
      value: "~22,6 M\u20AC",
      icon: Euro,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  const kpiRow2 = [
    {
      title: "Azioni completate",
      value: String(statiCombined.completato),
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Azioni in corso",
      value: String(statiCombined.in_corso),
      icon: Clock,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "Azioni pianificate",
      value: String(statiCombined.pianificato),
      icon: CalendarClock,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
    },
    {
      title: "Azioni sospese",
      value: String(statiCombined.sospeso),
      icon: Pause,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Piano d&apos;Azione Completo
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Riepilogo di tutte le azioni PAESC con stato di monitoraggio
        </p>
      </div>

      {/* ── Section 1: KPI Summary Cards (8 cards, 4-col grid) ──── */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiRow1.map((kpi) => (
            <Card key={kpi.title} className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {kpi.title}
                  </CardDescription>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      kpi.iconBg
                    )}
                  >
                    <kpi.icon
                      className={cn("h-4 w-4 shrink-0", kpi.iconColor)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiRow2.map((kpi) => (
            <Card key={kpi.title} className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {kpi.title}
                  </CardDescription>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      kpi.iconBg
                    )}
                  >
                    <kpi.icon
                      className={cn("h-4 w-4 shrink-0", kpi.iconColor)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 2: Timeline / Roadmap ────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Roadmap PAESC
        </h2>
        <Card className="bg-white shadow-sm">
          <CardContent className="py-8 px-6">
            <div className="relative flex items-center justify-between">
              {/* Connection line */}
              <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 -translate-y-1/2 bg-slate-300" />

              {/* Milestone: 2000 */}
              <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-300 bg-white shadow-md">
                  <span className="text-sm font-bold text-slate-600">
                    2000
                  </span>
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    IBE Baseline
                  </p>
                  <p className="text-lg font-bold tabular-nums text-slate-900">
                    {formatNumber(PAESC.tco2_ibe_2000)}
                  </p>
                  <p className="text-xs text-slate-400">tCO&#8322;</p>
                </div>
              </div>

              {/* Milestone: 2021 */}
              <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-teal-400 bg-white shadow-md">
                  <span className="text-sm font-bold text-teal-600">
                    2021
                  </span>
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-500">
                    IME Monitoraggio
                  </p>
                  <p className="text-lg font-bold tabular-nums text-slate-900">
                    {formatNumber(PAESC.tco2_ime_2021)}
                  </p>
                  <p className="text-xs text-slate-400">
                    tCO&#8322; &middot; -18,4%
                  </p>
                </div>
              </div>

              {/* Milestone: 2030 */}
              <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-500 bg-white shadow-md">
                  <span className="text-sm font-bold text-emerald-600">
                    2030
                  </span>
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                    Target
                  </p>
                  <p className="text-lg font-bold tabular-nums text-slate-900">
                    {formatNumber(PAESC.tco2_attese_2030)}
                  </p>
                  <p className="text-xs text-slate-400">
                    tCO&#8322; &middot; -55,7%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 3: Riepilogo Macrotemi ───────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Riepilogo Macrotemi
        </h2>

        {macrotemiSummary.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">
                Nessun macrotema disponibile. I dati saranno visibili dopo il primo inserimento nel database.
              </p>
            </CardContent>
          </Card>
        ) : (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[50px] text-slate-500">#</TableHead>
                  <TableHead className="text-slate-500">Macrotema</TableHead>
                  <TableHead className="text-right text-slate-500">
                    tCO&#8322; previste
                  </TableHead>
                  <TableHead className="text-right text-slate-500">
                    % totale
                  </TableHead>
                  <TableHead className="text-right text-slate-500">
                    Investimento
                  </TableHead>
                  <TableHead className="text-right text-slate-500">
                    N. azioni
                  </TableHead>
                  <TableHead className="text-slate-500">Stato medio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {macrotemiSummary.map((m) => {
                  const colore =
                    MACROTEMI_COLORS[m.label.toLowerCase()] ??
                    m.colore ??
                    "#6b7280";
                  const pctTotale =
                    totalTco2Macrotemi > 0
                      ? (m.tco2Previste / totalTco2Macrotemi) * 100
                      : 0;
                  return (
                    <TableRow
                      key={m.id}
                      className="border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        {m.numero}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: colore }}
                          />
                          {m.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-slate-700">
                        {formatNumber(m.tco2Previste)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-slate-500">
                        {formatPercent(pctTotale)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-slate-700">
                        {m.investimento_previsto
                          ? formatCurrency(m.investimento_previsto)
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-slate-700">
                        {m.nAzioni}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border-0",
                            getStatoColor(m.statoPredominante)
                          )}
                        >
                          {getStatoLabel(m.statoPredominante)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 4: Tabella Completa Mitigazione ──────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Tabella Completa Mitigazione
        </h2>

        {azioniMit.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nessuna azione di mitigazione trovata.
          </p>
        ) : (
          <Card className="bg-white shadow-sm overflow-x-auto">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[60px] text-slate-500">
                      ID
                    </TableHead>
                    <TableHead className="text-slate-500">
                      Macrotema
                    </TableHead>
                    <TableHead className="text-slate-500">Azione</TableHead>
                    <TableHead className="text-right text-slate-500">
                      tCO&#8322; previste
                    </TableHead>
                    <TableHead className="text-right text-slate-500">
                      tCO&#8322; effettive
                    </TableHead>
                    <TableHead className="text-slate-500">Stato</TableHead>
                    <TableHead className="w-[100px] text-right text-slate-500">
                      %
                    </TableHead>
                    <TableHead className="text-slate-500">
                      Ultimo agg.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {azioniMit.map((azione) => {
                    const agg = latestMitMap.get(azione.id);
                    const macro = macroMap.get(azione.macrotema_id);
                    const stato = agg?.stato ?? "pianificato";
                    const pct = agg?.percentuale_completamento ?? 0;
                    const colore = macro
                      ? MACROTEMI_COLORS[macro.label.toLowerCase()] ??
                        macro.colore
                      : "#6b7280";

                    return (
                      <TableRow
                        key={azione.id}
                        className="border-slate-100 hover:bg-slate-50"
                      >
                        <TableCell className="font-mono text-xs text-slate-500">
                          {azione.id}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <span
                              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: colore }}
                            />
                            {macro?.label ?? "\u2014"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <span className="line-clamp-2 text-sm text-slate-900">
                            {azione.titolo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-slate-700">
                          {formatNumber(azione.tco2_previste)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-slate-700">
                          {agg?.tco2_effettive != null
                            ? formatNumber(agg.tco2_effettive)
                            : "\u2014"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn("border-0", getStatoColor(stato))}
                          >
                            {getStatoLabel(stato)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  pct >= 100
                                    ? "bg-emerald-500"
                                    : pct >= 50
                                    ? "bg-teal-500"
                                    : "bg-slate-400"
                                )}
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="w-[32px] text-right text-xs tabular-nums text-slate-500">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(agg?.data_aggiornamento)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-slate-50 font-semibold hover:bg-slate-50">
                    <TableCell colSpan={3} className="text-sm text-slate-700">
                      Totale ({azioniMit.length} azioni)
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-slate-900">
                      {formatNumber(totalTco2PrevisteMit)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-slate-900">
                      {totalTco2EffettiveMit > 0
                        ? formatNumber(totalTco2EffettiveMit)
                        : "\u2014"}
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 5: Tabella Completa Adattamento ──────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Tabella Completa Adattamento
        </h2>

        {azioniAda.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nessuna azione di adattamento trovata.
          </p>
        ) : (
          <Card className="bg-white shadow-sm overflow-x-auto">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[60px] text-slate-500">
                      ID
                    </TableHead>
                    <TableHead className="text-slate-500">Azione</TableHead>
                    <TableHead className="text-slate-500">Pericoli</TableHead>
                    <TableHead className="text-slate-500">Settori</TableHead>
                    <TableHead className="text-slate-500">Stato</TableHead>
                    <TableHead className="w-[100px] text-right text-slate-500">
                      %
                    </TableHead>
                    <TableHead className="text-slate-500">
                      Ultimo agg.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {azioniAda.map((azione) => {
                    const agg = latestAdaMap.get(azione.id);
                    const stato = agg?.stato ?? "pianificato";
                    const pct = agg?.percentuale_completamento ?? 0;

                    return (
                      <TableRow
                        key={azione.id}
                        className="border-slate-100 hover:bg-slate-50"
                      >
                        <TableCell className="font-mono text-xs text-slate-500">
                          {azione.id}
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <span className="line-clamp-2 text-sm text-slate-900">
                            {azione.titolo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(azione.pericoli_climatici ?? []).length > 0 ? (
                              azione.pericoli_climatici.map((p) => (
                                <Badge
                                  key={p}
                                  className={cn(
                                    "border-0 px-1.5 py-0 text-[10px] font-medium",
                                    getPericoloColor(p)
                                  )}
                                >
                                  {p}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                &mdash;
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(azione.settori ?? []).length > 0 ? (
                              azione.settori.map((s) => (
                                <Badge
                                  key={s}
                                  variant="outline"
                                  className="px-1.5 py-0 text-[10px] font-medium text-slate-600 border-slate-300"
                                >
                                  {s}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                &mdash;
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn("border-0", getStatoColor(stato))}
                          >
                            {getStatoLabel(stato)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  pct >= 100
                                    ? "bg-emerald-500"
                                    : pct >= 50
                                    ? "bg-teal-500"
                                    : "bg-slate-400"
                                )}
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="w-[32px] text-right text-xs tabular-nums text-slate-500">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(agg?.data_aggiornamento)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 6: Investimenti ──────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Investimenti
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card 1: Investimento Previsto */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50">
                  <Euro className="h-4 w-4 text-violet-600" />
                </div>
                <CardTitle className="text-base text-slate-900">
                  Investimento Previsto
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Ripartizione per macrotema (dal PAESC)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investimentoPerMacrotema.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Nessun dato disponibile
                  </p>
                ) : (
                  investimentoPerMacrotema.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between"
                    >
                      <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: m.colore }}
                        />
                        {m.label}
                      </span>
                      <span className="text-sm font-medium tabular-nums text-slate-900">
                        {m.investimentoPrevisto > 0
                          ? formatCurrency(m.investimentoPrevisto)
                          : "\u2014"}
                      </span>
                    </div>
                  ))
                )}
                <Separator className="bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Totale previsto
                  </span>
                  <span className="text-sm font-bold tabular-nums text-slate-900">
                    {investimentoPrevisto > 0
                      ? formatCurrency(investimentoPrevisto)
                      : "\u2014"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Investimento Effettivo */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50">
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-base text-slate-900">
                  Investimento Effettivo
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Dai dati di monitoraggio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Totale effettivo
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-slate-900">
                    {investimentoEffettivoTotale > 0
                      ? formatCurrency(investimentoEffettivoTotale)
                      : "\u2014"}
                  </p>
                  {investimentoEffettivoTotale === 0 && (
                    <p className="text-xs text-slate-400">
                      Nessun dato di monitoraggio disponibile
                    </p>
                  )}
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Delta (effettivo - previsto)
                  </p>
                  {deltaInvestimento != null ? (
                    <p
                      className={cn(
                        "text-2xl font-bold tabular-nums",
                        deltaInvestimento >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      )}
                    >
                      {deltaInvestimento >= 0 ? "+" : ""}
                      {formatCurrency(deltaInvestimento)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-slate-300">
                      &mdash;
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* ── Section 7: Green Deal Context ────────────────────────── */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="flex items-start gap-4 py-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <Leaf className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Contesto Green Deal Europeo
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Il PAESC di Nichelino prevede una riduzione del{" "}
              <strong>-55,7%</strong> delle emissioni, superando
              l&apos;obiettivo minimo del -40% del Patto dei Sindaci e
              allineandosi al pacchetto{" "}
              <strong>Fit for 55</strong> del Green Deal Europeo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
