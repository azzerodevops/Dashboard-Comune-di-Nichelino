import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  Macrotema,
  AzioneMitigazione,
  AggiornamentoMitigazione,
} from "@/lib/supabase/types";
import { formatNumber, formatCurrency, getStatoColor, cn } from "@/lib/utils";
import { STATI_AZIONE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Target,
  Leaf,
  Banknote,
  TrendingDown,
  ClipboardList,
  ArrowRight,
  Building2,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hard-coded PAESC data per macrotema                                */
/* ------------------------------------------------------------------ */

type AzioneData = {
  id: string;
  titolo: string;
  tco2: number;
  mwh_term: number | null;
  mwh_el: number | null;
  note: string;
};

type EdificioData = {
  nome: string;
  indirizzo: string;
  tipo: string;
  costo: string;
};

type MacrotemaData = {
  numero: number;
  nome: string;
  colore: string;
  tco2: number;
  investimento: string;
  azioni: AzioneData[];
  edifici?: EdificioData[];
  noteExtra?: string;
};

const MACROTEMI_DATA: MacrotemaData[] = [
  {
    numero: 1,
    nome: "SETTORE PUBBLICO",
    colore: "#3b82f6",
    tco2: 589.44,
    investimento: "~17,4 M\u20AC",
    azioni: [
      { id: "1.1", titolo: "Audit energetici + efficientamento (Consip SIE 4)", tco2: 44.46, mwh_term: 443.44, mwh_el: -63.10, note: "Fabbisogno elettrico in aumento per PDC" },
      { id: "1.2", titolo: "FV edifici pubblici (CER-MN)", tco2: 48.18, mwh_term: null, mwh_el: null, note: "Potenza: 101,78 kWel" },
      { id: "1.3", titolo: "Cappotto termico edifici pubblici", tco2: 266.75, mwh_term: 1319.88, mwh_el: null, note: "" },
      { id: "1.4", titolo: "Sostituzione infissi", tco2: 64.91, mwh_term: 321.20, mwh_el: null, note: "" },
      { id: "1.5", titolo: "Valvole termostatiche", tco2: 64.29, mwh_term: 347.81, mwh_el: null, note: "" },
      { id: "1.6", titolo: "Illuminazione pubblica (PPP)", tco2: 100.85, mwh_term: null, mwh_el: 213.02, note: "" },
    ],
    edifici: [
      { nome: "Teatro Superga", indirizzo: "Via Superga", tipo: "EPC", costo: "~320.000\u20AC" },
      { nome: "Scuola Gramsci", indirizzo: "Via dei Cacciatori", tipo: "EPC", costo: "~795.000\u20AC" },
      { nome: "Scuola Rodari", indirizzo: "\u2014", tipo: "Demoliz. + ricostr. + Centro Famiglie", costo: "~9.400.000\u20AC" },
      { nome: "Scuola Papa Giovanni XXIII", indirizzo: "\u2014", tipo: "Demolizione", costo: "~920.000\u20AC" },
      { nome: "Via Prali", indirizzo: "\u2014", tipo: "Ricostruzione", costo: "~5.975.000\u20AC" },
    ],
  },
  {
    numero: 2,
    nome: "RESIDENZIALE",
    colore: "#f59e0b",
    tco2: 18014.56,
    investimento: "n.d.",
    azioni: [
      { id: "2.1", titolo: "Cappotto termico residenziale (Direttiva Case Verdi)", tco2: 6289.65, mwh_term: 31137.88, mwh_el: null, note: "Obbligo classe E entro 2030, classe D entro 2033" },
      { id: "2.2", titolo: "Sostituzione infissi residenziale", tco2: 1529.64, mwh_term: 7572.47, mwh_el: null, note: "" },
      { id: "2.3", titolo: "Sostituzione caldaie con PDC", tco2: 6439.37, mwh_term: 47275.15, mwh_el: null, note: "6.624 unit\u00E0 F+G interessate" },
      { id: "2.4", titolo: "Valvole termostatiche residenziale", tco2: 1512.42, mwh_term: 8185.80, mwh_el: null, note: "" },
      { id: "2.5", titolo: "FV residenziale (CER)", tco2: 243.48, mwh_term: null, mwh_el: null, note: "" },
      { id: "2.6", titolo: "Allaccio teleriscaldamento residenziale", tco2: 2000.00, mwh_term: null, mwh_el: null, note: "" },
    ],
    noteExtra: "Direttiva Case Verdi: 6.624 unit\u00E0 in classe F+G, 1.551.233 m\u00B2 di superficie complessiva",
  },
  {
    numero: 3,
    nome: "TERZIARIO",
    colore: "#8b5cf6",
    tco2: 7605.51,
    investimento: "n.d.",
    azioni: [
      { id: "3.1", titolo: "Efficientamento involucro terziario", tco2: 2476.37, mwh_term: 12258.25, mwh_el: null, note: "" },
      { id: "3.2", titolo: "Sostituzione infissi terziario", tco2: 602.12, mwh_term: 2980.82, mwh_el: null, note: "" },
      { id: "3.3", titolo: "Sostituzione caldaie terziario", tco2: 2533.49, mwh_term: 18601.57, mwh_el: null, note: "" },
      { id: "3.4", titolo: "FV terziario (CER)", tco2: 193.53, mwh_term: null, mwh_el: null, note: "" },
      { id: "3.5", titolo: "Allaccio teleriscaldamento terziario", tco2: 1800.00, mwh_term: null, mwh_el: null, note: "" },
    ],
    noteExtra: "2.540 unit\u00E0 commerciali, 200 m\u00B2 medi",
  },
  {
    numero: 4,
    nome: "INDUSTRIA",
    colore: "#ef4444",
    tco2: 3029.74,
    investimento: "n.d.",
    azioni: [
      { id: "4.1", titolo: "Efficientamento energetico industria (SBTi)", tco2: 3029.74, mwh_term: null, mwh_el: null, note: "SBTi target -42%, adesione stimata 25%" },
    ],
    noteExtra: "SBTi target -42%, adesione stimata 25%",
  },
  {
    numero: 5,
    nome: "TRASPORTI",
    colore: "#06b6d4",
    tco2: 18771.70,
    investimento: "n.d.",
    azioni: [
      { id: "5.1", titolo: "Flotta municipale elettrica", tco2: 18.40, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.2", titolo: "Potenziamento TPL e shift modale", tco2: 10511.75, mwh_term: null, mwh_el: null, note: "56% della riduzione del macrotema" },
      { id: "5.3", titolo: "Ciclabilit\u00E0 (BICIPLAN)", tco2: 2627.94, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.4", titolo: "Pedonalit\u00E0 e Zona 30", tco2: 1313.97, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.5", titolo: "Rinnovo parco auto privato (BEV)", tco2: 2101.18, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.6", titolo: "Smart working strutturale", tco2: 1050.59, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.7", titolo: "Logistica ultimo miglio", tco2: 525.29, mwh_term: null, mwh_el: null, note: "" },
      { id: "5.8", titolo: "Sharing mobility", tco2: 622.58, mwh_term: null, mwh_el: null, note: "" },
    ],
    noteExtra: "Azione 5.2 (TPL) copre 56% della riduzione del macrotema",
  },
  {
    numero: 6,
    nome: "PRODUZIONE FER",
    colore: "#22c55e",
    tco2: 20186.32,
    investimento: "n.d.",
    azioni: [
      { id: "6.1", titolo: "FV su coperture (CER municipale)", tco2: 4953.00, mwh_term: null, mwh_el: null, note: "" },
      { id: "6.2", titolo: "FV a terra (aree dismesse/parcheggi)", tco2: 8733.32, mwh_term: null, mwh_el: null, note: "" },
      { id: "6.3", titolo: "Espansione teleriscaldamento", tco2: 6500.00, mwh_term: null, mwh_el: null, note: "" },
    ],
    noteExtra: "Macrotema con maggiore impatto (23,22%)",
  },
  {
    numero: 7,
    nome: "ENERGIA VERDE",
    colore: "#84cc16",
    tco2: 18736.53,
    investimento: "n.d.",
    azioni: [
      { id: "7.1", titolo: "Acquisto energia verde \u2014 Pubblico", tco2: 1347.26, mwh_term: null, mwh_el: null, note: "100% fabbisogno elettrico" },
      { id: "7.2", titolo: "Acquisto energia verde \u2014 Residenziale", tco2: 4993.80, mwh_term: null, mwh_el: null, note: "25% fabbisogno elettrico" },
      { id: "7.3", titolo: "Acquisto energia verde \u2014 Terziario", tco2: 6955.33, mwh_term: null, mwh_el: null, note: "30% fabbisogno elettrico" },
      { id: "7.4", titolo: "Acquisto energia verde \u2014 Industria", tco2: 5440.14, mwh_term: null, mwh_el: null, note: "30% fabbisogno elettrico" },
    ],
    noteExtra: "% acquisto verde per settore: Pubblico 100%, Residenziale 25%, Terziario 30%, Industria 30%",
  },
];

const TOTAL_TCO2 = 86933.80;
const TOTAL_AZIONI = 33;

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function getStatoLabel(stato: string): string {
  const found = STATI_AZIONE.find((s) => s.value === stato);
  return found ? found.label : stato;
}

function fmtNum(n: number | null, decimals = 2): string {
  if (n == null) return "\u2014";
  return n.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function MitigazionePage() {
  const supabase = await createClient();

  const [{ data: macrotemi }, { data: azioni }, { data: aggiornamenti }] =
    await Promise.all([
      supabase.from("macrotemi").select("*").order("numero", { ascending: true }),
      supabase.from("azioni_mitigazione").select("*"),
      supabase
        .from("aggiornamenti_mitigazione")
        .select("*")
        .order("data_aggiornamento", { ascending: false }),
    ]);

  const macrotemiList = (macrotemi ?? []) as Macrotema[];
  const azioniList = (azioni ?? []) as AzioneMitigazione[];
  const aggiornamentiList = (aggiornamenti ?? []) as AggiornamentoMitigazione[];

  // Build map: azione_id -> latest aggiornamento
  const latestAggMap = new Map<string, AggiornamentoMitigazione>();
  for (const agg of aggiornamentiList) {
    if (!latestAggMap.has(agg.azione_id)) {
      latestAggMap.set(agg.azione_id, agg);
    }
  }

  // Map DB azioni by their display id (e.g. "1.1") for linking
  const azioniById = new Map<string, AzioneMitigazione>();
  for (const a of azioniList) {
    azioniById.set(a.id, a);
  }

  // Count azioni avviate (with at least one aggiornamento)
  const azioniAvviate = new Set(aggiornamentiList.map((a) => a.azione_id)).size;

  return (
    <div className="space-y-10">
      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Piano di Mitigazione
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          33 azioni in 7 macrotemi &mdash; Riduzione prevista:{" "}
          <span className="font-semibold text-slate-700">
            86.934 tCO&#8322;/anno
          </span>{" "}
          (-55,7%)
        </p>
      </div>

      {/* ============================================================ */}
      {/*  SUMMARY CARDS                                                */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50">
              <ClipboardList className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Totale azioni</p>
              <p className="text-2xl font-bold text-slate-900">33</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingDown className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Riduzione prevista</p>
              <p className="text-2xl font-bold text-slate-900">
                86.934{" "}
                <span className="text-sm font-medium text-slate-500">
                  tCO&#8322;/anno
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
              <Banknote className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Investimento</p>
              <p className="text-2xl font-bold text-slate-900">~22,6 M&#8364;</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50">
              <Target className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Azioni avviate</p>
              <p className="text-2xl font-bold text-slate-900">{azioniAvviate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/*  RIEPILOGO MACROTEMI TABLE                                    */}
      {/* ============================================================ */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Riepilogo Macrotemi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Macrotema</TableHead>
                <TableHead className="text-right">tCO&#8322;/anno</TableHead>
                <TableHead className="text-right">% totale</TableHead>
                <TableHead className="text-right">Investimento</TableHead>
                <TableHead className="text-right">N. azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MACROTEMI_DATA.map((m) => {
                const pctTotale = ((m.tco2 / TOTAL_TCO2) * 100).toFixed(2);
                return (
                  <TableRow key={m.numero}>
                    <TableCell className="text-center font-medium text-slate-500">
                      {m.numero}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: m.colore }}
                        />
                        <a
                          href={`#macrotema-${m.numero}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {m.nome}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {fmtNum(m.tco2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-slate-600">
                      {pctTotale}%
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {m.investimento}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {m.azioni.length}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-50 font-bold">
                <TableCell />
                <TableCell className="font-bold text-slate-900">TOTALE</TableCell>
                <TableCell className="text-right tabular-nums font-bold text-slate-900">
                  {fmtNum(TOTAL_TCO2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold text-slate-900">
                  100%
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  ~22,6 M&#8364;
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {TOTAL_AZIONI}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  MACROTEMI SECTIONS                                           */}
      {/* ============================================================ */}
      {MACROTEMI_DATA.map((m) => {
        const totalTco2 = m.azioni.reduce((s, a) => s + a.tco2, 0);

        return (
          <section
            key={m.numero}
            id={`macrotema-${m.numero}`}
            className="space-y-5"
          >
            {/* Colored header bar */}
            <div
              className="rounded-xl border px-5 py-4"
              style={{
                borderLeftWidth: 5,
                borderLeftColor: m.colore,
                backgroundColor: m.colore + "0A",
              }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-md"
                    style={{ backgroundColor: m.colore }}
                  />
                  <h2 className="text-lg font-bold text-slate-900">
                    Macrotema {m.numero} &mdash; {m.nome}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-semibold">
                    {fmtNum(totalTco2)} tCO&#8322;/anno
                  </span>
                  <span className="text-slate-400">|</span>
                  <span>{m.azioni.length} azioni</span>
                </div>
              </div>
              {m.noteExtra && (
                <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{m.noteExtra}</span>
                </div>
              )}
            </div>

            {/* Actions table */}
            <Card className="bg-white shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Azione</TableHead>
                      <TableHead className="text-right">tCO&#8322;/anno</TableHead>
                      <TableHead className="text-right">MWh termici</TableHead>
                      <TableHead className="text-right">MWh elettrici</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-28 text-center">Stato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {m.azioni.map((azione) => {
                      // Try to find matching DB azione for monitoring data
                      const dbAzione = azioniList.find(
                        (a) => a.id === azione.id || a.id.endsWith(azione.id)
                      );
                      const latest = dbAzione
                        ? latestAggMap.get(dbAzione.id)
                        : undefined;
                      const hasMonitoring = !!latest;
                      const stato = latest?.stato;
                      const pct = latest?.percentuale_completamento ?? 0;
                      const tco2Eff = latest?.tco2_effettive;
                      const detailHref = dbAzione
                        ? `/dashboard/mitigazione/${dbAzione.id}`
                        : `/dashboard/mitigazione/${azione.id}`;

                      return (
                        <TableRow key={azione.id} className="group">
                          <TableCell>
                            <span
                              className="text-sm font-bold"
                              style={{ color: m.colore }}
                            >
                              {azione.id}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={detailHref}
                              className="text-sm font-medium text-slate-900 hover:underline"
                            >
                              {azione.titolo}
                            </Link>
                            {hasMonitoring && tco2Eff != null && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                tCO&#8322; effettive:{" "}
                                <span className="font-semibold text-slate-600">
                                  {fmtNum(tco2Eff)}
                                </span>
                              </p>
                            )}
                            {hasMonitoring && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${Math.min(pct, 100)}%`,
                                      backgroundColor: m.colore,
                                    }}
                                  />
                                </div>
                                <span className="text-xs tabular-nums text-slate-500">
                                  {pct}%
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {fmtNum(azione.tco2)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-slate-600">
                            {azione.mwh_term != null
                              ? fmtNum(azione.mwh_term)
                              : "\u2014"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-slate-600">
                            {azione.mwh_el != null
                              ? fmtNum(azione.mwh_el)
                              : "\u2014"}
                          </TableCell>
                          <TableCell className="max-w-[200px] text-xs text-slate-500">
                            {azione.note || "\u2014"}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasMonitoring && stato ? (
                              <Badge
                                className={cn("border-0", getStatoColor(stato))}
                              >
                                {getStatoLabel(stato)}
                              </Badge>
                            ) : (
                              <Badge className="border-0 bg-slate-100 text-slate-500">
                                Da avviare
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-slate-50 font-bold">
                      <TableCell />
                      <TableCell className="font-bold text-slate-900">
                        TOTALE
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-slate-900">
                        {fmtNum(totalTco2)}
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Edifici coinvolti (only for macrotema 1) */}
            {m.edifici && m.edifici.length > 0 && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Edifici coinvolti (azione 1.1)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Edificio</TableHead>
                        <TableHead>Indirizzo</TableHead>
                        <TableHead>Tipologia intervento</TableHead>
                        <TableHead className="text-right">Costo stimato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {m.edifici.map((e) => (
                        <TableRow key={e.nome}>
                          <TableCell className="font-medium text-slate-900">
                            {e.nome}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {e.indirizzo}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {e.tipo}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-slate-900">
                            {e.costo}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Energia Verde breakdown */}
            {m.numero === 7 && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    % Acquisto energia verde per settore
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { settore: "Pubblico", pct: "100%", colore: "#3b82f6" },
                      { settore: "Residenziale", pct: "25%", colore: "#f59e0b" },
                      { settore: "Terziario", pct: "30%", colore: "#8b5cf6" },
                      { settore: "Industria", pct: "30%", colore: "#ef4444" },
                    ].map((item) => (
                      <div
                        key={item.settore}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.colore }}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.settore}
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {item.pct}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        );
      })}
    </div>
  );
}
