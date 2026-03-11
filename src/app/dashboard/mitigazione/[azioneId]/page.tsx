import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AzioneMitigazione,
  AggiornamentoMitigazione,
  Macrotema,
} from "@/lib/supabase/types";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  getStatoColor,
  cn,
} from "@/lib/utils";
import { STATI_AZIONE, MACROTEMI_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Plus,
  Target,
  Zap,
  Flame,
  Banknote,
  CalendarDays,
  FileText,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hard-coded PAESC data for fallback                                 */
/* ------------------------------------------------------------------ */

type AzioneStaticData = {
  id: string;
  titolo: string;
  tco2: number;
  mwh_term: number | null;
  mwh_el: number | null;
  note: string;
};

type MacrotemaStaticData = {
  numero: number;
  nome: string;
  colore: string;
  tco2: number;
  investimento: string;
  azioni: AzioneStaticData[];
  noteExtra?: string;
};

const MACROTEMI_DATA: MacrotemaStaticData[] = [
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
  },
];

/** Look up a static action + its parent macrotema by action ID (e.g. "1.1") */
function findStaticAzione(azioneId: string) {
  for (const m of MACROTEMI_DATA) {
    const a = m.azioni.find((az) => az.id === azioneId);
    if (a) return { azione: a, macrotema: m };
  }
  return null;
}

function getStatoLabel(stato: string): string {
  const found = STATI_AZIONE.find((s) => s.value === stato);
  return found ? found.label : stato;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AzioneDetailPage({
  params,
}: {
  params: Promise<{ azioneId: string }>;
}) {
  const { azioneId } = await params;
  const supabase = await createClient();

  /* ---------------------------------------------------------------- */
  /*  Try Supabase first                                               */
  /* ---------------------------------------------------------------- */
  const { data: azione } = await supabase
    .from("azioni_mitigazione")
    .select("*")
    .eq("id", azioneId)
    .single();

  const dbAzione = azione as AzioneMitigazione | null;

  /* ---------------------------------------------------------------- */
  /*  Fall back to static constants when DB has no data                 */
  /* ---------------------------------------------------------------- */
  const staticMatch = findStaticAzione(azioneId);

  if (!dbAzione && !staticMatch) {
    notFound();
  }

  // Build a unified view that works for both DB and static data
  const azioneId_display = dbAzione?.id ?? staticMatch!.azione.id;
  const azioneTitolo = dbAzione?.titolo ?? staticMatch!.azione.titolo;
  const azioneDescrizione = dbAzione?.descrizione ?? (staticMatch?.azione.note || null);
  const azioneTco2 = dbAzione?.tco2_previste ?? staticMatch!.azione.tco2;
  const azioneMwhTerm = dbAzione?.mwh_termici_previsti ?? staticMatch?.azione.mwh_term ?? null;
  const azioneMwhEl = dbAzione?.mwh_elettrici_previsti ?? staticMatch?.azione.mwh_el ?? null;
  const azioneInvestimento = dbAzione?.investimento_previsto ?? null;
  const azioneAnnoAvvio = dbAzione?.anno_avvio_previsto ?? null;
  const azioneAnnoFine = dbAzione?.anno_fine_previsto ?? null;
  const azioneNotePaesc = dbAzione?.note_paesc ?? (staticMatch?.azione.note || null);

  /* Macrotema info */
  let macroNome: string | null = null;
  let macroColore = "#3b82f6";

  if (dbAzione) {
    const { data: macrotema } = await supabase
      .from("macrotemi")
      .select("*")
      .eq("id", dbAzione.macrotema_id)
      .single();

    const macrotemaTipizzato = macrotema as Macrotema | null;
    macroNome = macrotemaTipizzato?.label ?? null;
    macroColore = macrotemaTipizzato
      ? MACROTEMI_COLORS[macrotemaTipizzato.label.toLowerCase()] ??
        macrotemaTipizzato.colore
      : "#3b82f6";
  } else if (staticMatch) {
    macroNome = staticMatch.macrotema.nome;
    macroColore = staticMatch.macrotema.colore;
  }

  /* Aggiornamenti */
  const { data: aggiornamenti } = await supabase
    .from("aggiornamenti_mitigazione")
    .select("*")
    .eq("azione_id", azioneId)
    .order("data_aggiornamento", { ascending: false });

  const aggList = (aggiornamenti ?? []) as AggiornamentoMitigazione[];
  const latest = aggList.length > 0 ? aggList[0] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/dashboard/mitigazione"
          className="transition-colors hover:text-slate-900"
        >
          Mitigazione
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {macroNome && (
          <>
            <span className="text-slate-500">
              {macroNome}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="font-medium text-slate-900">
          {azioneId_display}
        </span>
      </nav>

      {/* Header with colored accent */}
      <div
        className="rounded-xl border bg-white p-5 shadow-sm"
        style={{ borderLeftWidth: 4, borderLeftColor: macroColore }}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: macroColore }}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{ color: macroColore }}>
              {azioneId_display}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
              {azioneTitolo}
            </h1>
          </div>
        </div>
        {azioneDescrizione && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {azioneDescrizione}
          </p>
        )}
        {azioneNotePaesc && azioneNotePaesc !== azioneDescrizione && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-600">
              <span className="font-medium text-slate-700">Note PAESC:</span>{" "}
              {azioneNotePaesc}
            </p>
          </div>
        )}
        {(azioneAnnoAvvio || azioneAnnoFine) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              Periodo previsto: {azioneAnnoAvvio ?? "\u2014"}{" "}
              \u2013 {azioneAnnoFine ?? "\u2014"}
            </span>
          </div>
        )}
        {/* Show macrotema badge for static fallback */}
        {macroNome && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: macroColore }}
            />
            <span className="text-xs font-medium text-slate-500">
              Macrotema {staticMatch?.macrotema.numero ?? ""} &mdash; {macroNome}
            </span>
          </div>
        )}
      </div>

      {/* Target values */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Valori previsti (target PAESC)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card size="sm" className="bg-white shadow-sm">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">tCO&#8322; previste</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatNumber(azioneTco2, 2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-white shadow-sm">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">MWh termici previsti</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatNumber(azioneMwhTerm, 2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-white shadow-sm">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  MWh elettrici previsti
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatNumber(azioneMwhEl, 2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-white shadow-sm">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                <Banknote className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Investimento previsto
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {azioneInvestimento != null
                    ? formatCurrency(azioneInvestimento)
                    : staticMatch
                      ? staticMatch.macrotema.investimento
                      : "\u2014"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Current status */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Stato attuale
        </h2>
        {latest ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("border-0", getStatoColor(latest.stato))}>
                  {getStatoLabel(latest.stato)}
                </Badge>
                <span className="text-xs text-slate-400">
                  Ultimo aggiornamento:{" "}
                  {formatDate(latest.data_aggiornamento)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Completamento</span>
                  <span className="font-medium text-slate-900">
                    {formatPercent(latest.percentuale_completamento, 0)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(latest.percentuale_completamento, 100)}%`,
                      backgroundColor: macroColore,
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">tCO&#8322; effettive</p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatNumber(latest.tco2_effettive)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    MWh termici effettivi
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatNumber(latest.mwh_termici_effettivi)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    MWh elettrici effettivi
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatNumber(latest.mwh_elettrici_effettivi)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    Investimento effettivo
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatCurrency(latest.investimento_effettivo)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Info className="h-6 w-6 text-blue-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Nessun aggiornamento inserito
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Questa azione non risulta ancora avviata. Aggiungi il primo
                  aggiornamento per iniziare il monitoraggio.
                </p>
                <Link
                  href={`/dashboard/mitigazione/${azioneId}/aggiorna`}
                  className="mt-4"
                >
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Aggiungi il primo aggiornamento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-slate-200" />

      {/* Storico aggiornamenti */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Storico aggiornamenti
          </h2>
          <Link href={`/dashboard/mitigazione/${azioneId}/aggiorna`}>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Inserisci aggiornamento
            </Button>
          </Link>
        </div>

        {aggList.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">
                  Nessun aggiornamento registrato per questa azione.
                </p>
                <Link
                  href={`/dashboard/mitigazione/${azioneId}/aggiorna`}
                  className="mt-3"
                >
                  <Button variant="outline" size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    Inserisci il primo aggiornamento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-500">Data</TableHead>
                    <TableHead className="text-slate-500">Stato</TableHead>
                    <TableHead className="text-right text-slate-500">
                      %
                    </TableHead>
                    <TableHead className="text-right text-slate-500">
                      tCO&#8322;
                    </TableHead>
                    <TableHead className="hidden text-slate-500 md:table-cell">
                      Note
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggList.map((agg) => (
                    <TableRow
                      key={agg.id}
                      className="border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="text-slate-700">
                        {formatDate(agg.data_aggiornamento)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn("border-0", getStatoColor(agg.stato))}
                        >
                          {getStatoLabel(agg.stato)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">
                        {formatPercent(agg.percentuale_completamento, 0)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-700">
                        {formatNumber(agg.tco2_effettive)}
                      </TableCell>
                      <TableCell className="hidden max-w-[300px] truncate text-slate-400 md:table-cell">
                        {agg.note ?? "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
