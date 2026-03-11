import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  RischioClimatico,
  AzioneAdattamento,
  AggiornamentoAdattamento,
} from "@/lib/supabase/types";
import { cn, getStatoColor } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
} from "@/components/ui/table";
import {
  Shield,
  AlertTriangle,
  Target as TargetIcon,
  CalendarDays,
  ExternalLink,
  Droplets,
  TreePine,
  Siren,
  Building2,
  Megaphone,
  HeartPulse,
  Thermometer,
  CloudRain,
  Flame,
  Mountain,
  Bug,
  TrendingUp,
  Sprout,
} from "lucide-react";
import {
  STATI_AZIONE,
  PERICOLOSITA_IDRAULICA,
  OBIETTIVI_ADATTAMENTO,
  RISCHI_CLIMATICI,
  AZIONI_ADATTAMENTO_DATI,
} from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRischioColor(livello: string): string {
  const l = livello.toLowerCase();
  const map: Record<string, string> = {
    irrilevante: "bg-gray-100 text-gray-700 border-gray-200",
    basso: "bg-green-100 text-green-700 border-green-200",
    "medio-basso": "bg-yellow-50 text-yellow-700 border-yellow-200",
    medio: "bg-amber-100 text-amber-700 border-amber-200",
    "medio-alto": "bg-orange-100 text-orange-700 border-orange-200",
    alto: "bg-red-100 text-red-700 border-red-200",
    critico: "bg-red-200 text-red-900 border-red-300",
  };
  return map[l] || "bg-gray-100 text-gray-700 border-gray-200";
}

function getRischioBgColor(livello: string): string {
  const l = livello.toLowerCase();
  const map: Record<string, string> = {
    irrilevante: "bg-gray-50",
    basso: "bg-green-50",
    "medio-basso": "bg-yellow-50",
    medio: "bg-amber-50",
    "medio-alto": "bg-orange-50",
    alto: "bg-red-50",
    critico: "bg-red-100",
  };
  return map[l] || "bg-gray-50";
}

function getRischioBarColor(livello: string): string {
  const l = livello.toLowerCase();
  const map: Record<string, string> = {
    irrilevante: "bg-gray-300",
    basso: "bg-green-400",
    "medio-basso": "bg-yellow-400",
    medio: "bg-amber-400",
    "medio-alto": "bg-orange-400",
    alto: "bg-red-500",
    critico: "bg-red-700",
  };
  return map[l] || "bg-gray-300";
}

function getRischioBarWidth(livello: string): string {
  const l = livello.toLowerCase();
  const map: Record<string, string> = {
    irrilevante: "w-[10%]",
    basso: "w-[25%]",
    "medio-basso": "w-[40%]",
    medio: "w-[55%]",
    "medio-alto": "w-[70%]",
    alto: "w-[85%]",
    critico: "w-full",
  };
  return map[l] || "w-[10%]";
}

function getTendenzaBadge(tendenza: string) {
  const t = tendenza.toLowerCase();
  if (t.includes("forte aumento")) {
    return {
      arrow: "\u2B06",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }
  if (t.includes("aumento")) {
    return {
      arrow: "\u2197",
      className: "bg-orange-100 text-orange-700 border-orange-200",
    };
  }
  return {
    arrow: "\u2192",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };
}

function isHighRisk(livello: string): boolean {
  return livello.toLowerCase() === "alto" || livello.toLowerCase() === "critico";
}

function getPericoloColor(pericolo: string): string {
  const p = pericolo.toLowerCase();
  if (p.includes("caldo") || p.includes("estremo"))
    return "bg-red-50 text-red-700 border-red-200";
  if (p.includes("alluvion"))
    return "bg-teal-50 text-teal-700 border-teal-200";
  if (p.includes("precipitaz"))
    return "bg-sky-50 text-sky-700 border-sky-200";
  if (p.includes("siccit"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (p.includes("incendio") || p.includes("incendi"))
    return "bg-orange-50 text-orange-700 border-orange-200";
  if (p.includes("fran"))
    return "bg-stone-50 text-stone-700 border-stone-200";
  if (p.includes("biologic"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function getPericoloIcon(pericolo: string) {
  const p = pericolo.toLowerCase();
  if (p.includes("caldo") || p.includes("estremo")) return Thermometer;
  if (p.includes("alluvion")) return Droplets;
  if (p.includes("precipitaz")) return CloudRain;
  if (p.includes("siccit")) return Sprout;
  if (p.includes("incendio") || p.includes("incendi")) return Flame;
  if (p.includes("fran")) return Mountain;
  if (p.includes("biologic")) return Bug;
  return AlertTriangle;
}

const OBIETTIVO_ICONS: Record<string, string> = {
  O1: "bg-indigo-50 text-indigo-600 border-indigo-200",
  O2: "bg-sky-50 text-sky-600 border-sky-200",
  O3: "bg-violet-50 text-violet-600 border-violet-200",
  O4: "bg-red-50 text-red-600 border-red-200",
  O5: "bg-teal-50 text-teal-600 border-teal-200",
  O6: "bg-cyan-50 text-cyan-600 border-cyan-200",
  O7: "bg-emerald-50 text-emerald-600 border-emerald-200",
  O8: "bg-rose-50 text-rose-600 border-rose-200",
};

const OBIETTIVO_SHORT: Record<string, string> = {
  O1: "Monitoraggio territorio",
  O2: "Consapevolezza climatica",
  O3: "Dati sui rischi",
  O4: "Sistemi di allertamento",
  O5: "Sicurezza idraulica",
  O6: "Efficienza idrica",
  O7: "Resilienza urbana",
  O8: "Insetti vettori",
};

const GRUPPI_AZIONI: {
  titolo: string;
  descrizione: string;
  icon: typeof Siren;
  ids: string[];
  borderColor: string;
  bgColor: string;
}[] = [
  {
    titolo: "Protezione civile e allerta",
    descrizione: "Sistemi di allertamento, monitoraggio e piani di emergenza",
    icon: Siren,
    ids: ["A1", "A3", "A4"],
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/30",
  },
  {
    titolo: "Resilienza edilizia e urbanistica",
    descrizione: "Normativa edilizia e pianificazione urbanistica adattiva",
    icon: Building2,
    ids: ["A2", "A9"],
    borderColor: "border-l-violet-500",
    bgColor: "bg-violet-50/30",
  },
  {
    titolo: "Sensibilizzazione e formazione",
    descrizione: "Campagne informative e percorsi di co-progettazione",
    icon: Megaphone,
    ids: ["A5"],
    borderColor: "border-l-sky-500",
    bgColor: "bg-sky-50/30",
  },
  {
    titolo: "Sicurezza idraulica",
    descrizione: "Messa in sicurezza spondale, manutenzione corsi d'acqua e riqualificazione fluviale",
    icon: Droplets,
    ids: ["A6", "A7", "A12"],
    borderColor: "border-l-teal-500",
    bgColor: "bg-teal-50/30",
  },
  {
    titolo: "Infrastrutture verdi e biodiversit\u00E0",
    descrizione: "Verde urbano, specie autoctone e rinaturalizzazione",
    icon: TreePine,
    ids: ["A8", "A11"],
    borderColor: "border-l-green-500",
    bgColor: "bg-green-50/30",
  },
  {
    titolo: "Salute e agricoltura",
    descrizione: "Lotta biologica e pratiche agricole resilienti",
    icon: HeartPulse,
    ids: ["A10", "A13"],
    borderColor: "border-l-rose-500",
    bgColor: "bg-rose-50/30",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default async function AdattamentoPage() {
  const supabase = await createClient();

  const [{ data: rischiDb }, { data: azioniDb }] = await Promise.all([
    supabase
      .from("rischi_climatici")
      .select("*")
      .returns<RischioClimatico[]>(),
    supabase
      .from("azioni_adattamento")
      .select("*")
      .returns<AzioneAdattamento[]>(),
  ]);

  // Use DB data if available, otherwise fall back to constants
  const rischi: RischioClimatico[] =
    rischiDb && rischiDb.length > 0
      ? rischiDb
      : RISCHI_CLIMATICI.map((r) => ({
          ...r,
          note: r.note ?? null,
        }));

  const azioni: AzioneAdattamento[] =
    azioniDb && azioniDb.length > 0
      ? azioniDb
      : AZIONI_ADATTAMENTO_DATI.map((a) => ({
          ...a,
          descrizione: a.descrizione ?? null,
          periodo_inizio: a.periodo_inizio ?? null,
          periodo_fine: a.periodo_fine ?? null,
          pericoli_climatici: [...a.pericoli_climatici],
          settori: [...a.settori],
          obiettivi: [...a.obiettivi],
        }));

  // Fetch latest aggiornamento for each azione
  const azioniIds = azioniDb?.map((a) => a.id) ?? [];
  let aggiornamenti: AggiornamentoAdattamento[] = [];
  if (azioniIds.length > 0) {
    const { data } = await supabase
      .from("aggiornamenti_adattamento")
      .select("*")
      .in("azione_id", azioniIds)
      .order("data_aggiornamento", { ascending: false })
      .returns<AggiornamentoAdattamento[]>();
    aggiornamenti = data ?? [];
  }

  // Map: azione_id -> latest aggiornamento
  const latestAgg = new Map<string, AggiornamentoAdattamento>();
  for (const agg of aggiornamenti) {
    if (!latestAgg.has(agg.azione_id)) {
      latestAgg.set(agg.azione_id, agg);
    }
  }

  const getStatoLabel = (stato: string) =>
    STATI_AZIONE.find((s) => s.value === stato)?.label ?? stato;

  // Index azioni by id for grouped display
  const azioniMap = new Map<string, AzioneAdattamento>();
  for (const a of azioni) {
    azioniMap.set(a.id, a);
  }

  // Count azioni per obiettivo
  const azioniPerObiettivo: Record<string, number> = {};
  for (const a of azioni) {
    for (const o of a.obiettivi) {
      azioniPerObiettivo[o] = (azioniPerObiettivo[o] ?? 0) + 1;
    }
  }

  // Sort rischi by severity
  const rischioOrder: Record<string, number> = {
    alto: 0,
    critico: 0,
    "medio-alto": 1,
    medio: 2,
    "medio-basso": 3,
    basso: 4,
    irrilevante: 5,
  };
  const sortedRischi = [...rischi].sort(
    (a, b) =>
      (rischioOrder[a.livello.toLowerCase()] ?? 9) -
      (rischioOrder[b.livello.toLowerCase()] ?? 9)
  );

  return (
    <div className="space-y-10">
      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Shield className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Piano di Adattamento
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              13 azioni &mdash; 7 rischi climatici &mdash; 8 obiettivi
              strategici
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rischi mappati</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{rischi.length}</p>
            <p className="mt-0.5 text-xs text-red-500">di cui 1 ALTO</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Azioni attive</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{azioni.length}</p>
            <p className="mt-0.5 text-xs text-slate-500">su 6 ambiti</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Obiettivi</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{OBIETTIVI_ADATTAMENTO.length}</p>
            <p className="mt-0.5 text-xs text-slate-500">strategici</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pop. a rischio</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">16.651</p>
            <p className="mt-0.5 text-xs text-amber-500">35,9% del totale</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: Matrice dei Rischi Climatici                       */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Matrice dei Rischi Climatici
          </h2>
          <Badge className="border-0 bg-slate-100 text-slate-600">
            {rischi.length} rischi
          </Badge>
        </div>

        {/* Visual risk cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedRischi.map((r) => {
            const tend = getTendenzaBadge(r.tendenza);
            const highlight = isHighRisk(r.livello);
            const PericoloIcon = getPericoloIcon(r.pericolo);
            const impatto = 'impatto' in r ? (r as RischioClimatico & { impatto?: string }).impatto : r.livello;

            return (
              <Card
                key={r.id}
                className={cn(
                  "overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md",
                  highlight && "ring-2 ring-red-300/70"
                )}
              >
                {/* Color bar on top */}
                <div
                  className={cn(
                    "h-1.5",
                    highlight ? "bg-red-500" : getRischioBarColor(r.livello)
                  )}
                />
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          highlight
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        <PericoloIcon className="h-5 w-5" />
                      </div>
                      <h3
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          highlight ? "text-red-800" : "text-slate-900"
                        )}
                      >
                        {r.pericolo}
                      </h3>
                    </div>
                  </div>

                  {/* Risk level badge */}
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "border font-semibold",
                        getRischioColor(r.livello),
                        highlight && "text-red-800"
                      )}
                    >
                      {r.livello.toUpperCase()}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", tend.className)}
                    >
                      {tend.arrow} {r.tendenza}
                    </Badge>
                  </div>

                  {/* Risk bar */}
                  <div className="space-y-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          getRischioBarColor(r.livello),
                          getRischioBarWidth(r.livello)
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        Probabilit&agrave;: <span className="font-medium text-slate-600">{r.probabilita}</span>
                      </span>
                      <span>
                        Impatto: <span className="font-medium text-slate-600">{impatto}</span>
                      </span>
                    </div>
                  </div>

                  {r.note && (
                    <p className="text-xs leading-relaxed text-slate-500">
                      {r.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop: full table */}
        <Card className="hidden bg-white shadow-sm xl:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="text-slate-500">
                    Pericolo
                  </TableHead>
                  <TableHead className="text-slate-500">
                    Probabilit&agrave;
                  </TableHead>
                  <TableHead className="text-slate-500">
                    Impatto
                  </TableHead>
                  <TableHead className="text-slate-500">
                    Rischio
                  </TableHead>
                  <TableHead className="text-slate-500">
                    Tendenza
                  </TableHead>
                  <TableHead className="text-slate-500">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRischi.map((r) => {
                  const tend = getTendenzaBadge(r.tendenza);
                  const highlight = isHighRisk(r.livello);
                  const impatto = 'impatto' in r ? (r as RischioClimatico & { impatto?: string }).impatto : r.livello;

                  return (
                    <TableRow
                      key={r.id}
                      className={cn(
                        "border-slate-100",
                        highlight
                          ? "bg-red-50/60 hover:bg-red-50"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-block h-2.5 w-2.5 rounded-full",
                              getRischioBarColor(r.livello)
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold",
                              highlight ? "text-red-800" : "text-slate-900"
                            )}
                          >
                            {r.pericolo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {r.probabilita}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {impatto}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border font-semibold",
                            getRischioColor(r.livello),
                            highlight && "text-red-800"
                          )}
                        >
                          {r.livello.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", tend.className)}
                        >
                          {tend.arrow} {r.tendenza}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[350px] text-sm leading-relaxed text-slate-500">
                        {r.note || "\u2014"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: Dettaglio Rischio Alluvioni                        */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <Card className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-sm">
          <div className="h-1 bg-teal-400" />
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
                <Droplets className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-teal-900">
                  Dettaglio Rischio Alluvioni
                </CardTitle>
                <CardDescription className="mt-1 text-sm font-medium text-teal-700">
                  Oltre un terzo della popolazione risiede in aree a
                  pericolosit&agrave; idraulica media (P2)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual summary */}
            <div className="grid gap-3 sm:grid-cols-2">
              {PERICOLOSITA_IDRAULICA.map((p) => (
                <div
                  key={p.classe}
                  className={cn(
                    "rounded-xl border p-4",
                    p.classe === "P3"
                      ? "border-red-200 bg-red-50/60"
                      : "border-amber-200 bg-amber-50/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                        p.classe === "P3"
                          ? "bg-red-200 text-red-800"
                          : "bg-amber-200 text-amber-800"
                      )}
                    >
                      {p.classe}
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          p.classe === "P3" ? "text-red-800" : "text-amber-800"
                        )}
                      >
                        {p.descrizione}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          p.classe === "P3" ? "text-red-600" : "text-amber-600"
                        )}
                      >
                        {p.superficie_km2.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        km&sup2;
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p
                        className={cn(
                          "text-2xl font-bold tabular-nums",
                          p.classe === "P3" ? "text-red-700" : "text-amber-700"
                        )}
                      >
                        {p.abitanti_esposti.toLocaleString("it-IT")}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          p.classe === "P3" ? "text-red-500" : "text-amber-500"
                        )}
                      >
                        abitanti esposti ({p.pct_popolazione}%)
                      </p>
                    </div>
                    {"edifici" in p && (
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-lg font-bold tabular-nums",
                            p.classe === "P3" ? "text-red-700" : "text-amber-700"
                          )}
                        >
                          {p.edifici}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            p.classe === "P3" ? "text-red-500" : "text-amber-500"
                          )}
                        >
                          edifici
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2">
              <Droplets className="h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Corsi d&apos;acqua:</span>{" "}
                Torrente Sangone (N), Fiume Po via Moncalieri (NE), Canale Laira
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-slate-200" />

      {/* ============================================================ */}
      {/* SECTION 3: Obiettivi di Adattamento (O1-O8)                   */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TargetIcon className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Obiettivi di Adattamento
          </h2>
          <Badge className="border-0 bg-slate-100 text-slate-600">
            {OBIETTIVI_ADATTAMENTO.length} obiettivi
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OBIETTIVI_ADATTAMENTO.map((obj) => {
            const colorClass = OBIETTIVO_ICONS[obj.id] ?? "bg-slate-50 text-slate-600 border-slate-200";
            const shortLabel = OBIETTIVO_SHORT[obj.id] ?? "";
            const count = azioniPerObiettivo[obj.id] ?? 0;

            return (
              <Card key={obj.id} className="overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md">
                <div
                  className={cn(
                    "h-1",
                    obj.id === "O1" && "bg-indigo-400",
                    obj.id === "O2" && "bg-sky-400",
                    obj.id === "O3" && "bg-violet-400",
                    obj.id === "O4" && "bg-red-400",
                    obj.id === "O5" && "bg-teal-400",
                    obj.id === "O6" && "bg-cyan-400",
                    obj.id === "O7" && "bg-emerald-400",
                    obj.id === "O8" && "bg-rose-400"
                  )}
                />
                <CardContent className="space-y-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
                        colorClass
                      )}
                    >
                      {obj.id}
                    </span>
                    <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-500">
                      {count} {count === 1 ? "azione" : "azioni"}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {shortLabel}
                  </p>
                  <p className="text-sm leading-snug text-slate-700">
                    {obj.obiettivo}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="bg-slate-200" />

      {/* ============================================================ */}
      {/* SECTION 4: Le 13 Azioni di Adattamento                       */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Le 13 Azioni di Adattamento
          </h2>
          <Badge className="border-0 bg-slate-100 text-slate-600">
            {azioni.length} azioni
          </Badge>
        </div>

        <div className="space-y-8">
          {GRUPPI_AZIONI.map((gruppo) => {
            const GruppoIcon = gruppo.icon;
            const azioniGruppo = gruppo.ids
              .map((id) => azioniMap.get(id))
              .filter(Boolean) as AzioneAdattamento[];

            if (azioniGruppo.length === 0) return null;

            return (
              <div key={gruppo.titolo} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      gruppo.bgColor
                    )}
                  >
                    <GruppoIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                      {gruppo.titolo}
                    </h3>
                    <p className="text-xs text-slate-400">{gruppo.descrizione}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {azioniGruppo.map((azione) => {
                    const agg = latestAgg.get(azione.id);
                    const hasMonitoring = !!agg;
                    const stato = agg?.stato ?? "non_avviata";
                    const statoLabel =
                      stato === "non_avviata"
                        ? "Da avviare"
                        : getStatoLabel(stato);
                    const statoColor =
                      stato === "non_avviata"
                        ? "bg-slate-100 text-slate-500"
                        : getStatoColor(stato);
                    const pct = agg?.percentuale_completamento ?? 0;

                    return (
                      <Link
                        key={azione.id}
                        href={`/dashboard/adattamento/${azione.id}`}
                        className="group"
                      >
                        <Card
                          className={cn(
                            "h-full border-l-4 bg-white shadow-sm transition-all hover:shadow-md hover-lift",
                            gruppo.borderColor
                          )}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm leading-snug text-slate-900">
                                <span className="mr-2 inline-flex h-6 w-8 items-center justify-center rounded bg-teal-50 text-xs font-bold text-teal-700">
                                  {azione.id}
                                </span>
                                {azione.titolo}
                              </CardTitle>
                              <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Descrizione */}
                            {azione.descrizione && (
                              <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                                {azione.descrizione}
                              </p>
                            )}

                            {/* Pericoli climatici */}
                            {azione.pericoli_climatici.length > 0 && (
                              <div>
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                  Pericoli climatici
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {azione.pericoli_climatici.map((p) => (
                                    <Badge
                                      key={p}
                                      className={cn(
                                        "border text-[10px]",
                                        getPericoloColor(p)
                                      )}
                                    >
                                      {p}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Settori */}
                            {azione.settori.length > 0 && (
                              <div>
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                  Settori
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {azione.settori.map((s) => (
                                    <Badge
                                      key={s}
                                      variant="outline"
                                      className="border-slate-200 text-[10px] text-slate-600"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Obiettivi */}
                            {azione.obiettivi.length > 0 && (
                              <div>
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                  Obiettivi
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {azione.obiettivi.map((o) => {
                                    const oColor = OBIETTIVO_ICONS[o] ?? "bg-slate-50 text-slate-600 border-slate-200";
                                    return (
                                      <Badge
                                        key={o}
                                        className={cn(
                                          "border text-[10px] font-semibold",
                                          oColor
                                        )}
                                      >
                                        {o}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <Separator className="bg-slate-100" />

                            {/* Stato + Completamento */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge className={cn("border-0", statoColor)}>
                                {statoLabel}
                              </Badge>
                              {hasMonitoring && (
                                <span className="text-xs tabular-nums text-slate-500">
                                  {pct}%
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            {hasMonitoring && (
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-teal-500 transition-all"
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                  }}
                                />
                              </div>
                            )}

                            {/* Periodo */}
                            {(azione.periodo_inizio ||
                              azione.periodo_fine) && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <CalendarDays className="h-3 w-3" />
                                <span>
                                  {azione.periodo_inizio ?? "\u2014"}{" "}
                                  &ndash;{" "}
                                  {azione.periodo_fine ?? "\u2014"}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
