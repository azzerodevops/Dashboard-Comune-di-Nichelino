import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AzioneAdattamento,
  AggiornamentoAdattamento,
} from "@/lib/supabase/types";
import { cn, getStatoColor, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ChevronRight,
  Plus,
  Info,
  CalendarDays,
  Shield,
} from "lucide-react";
import { STATI_AZIONE, AZIONI_ADATTAMENTO_DATI } from "@/lib/constants";

function getStatoLabel(stato: string) {
  return STATI_AZIONE.find((s) => s.value === stato)?.label ?? stato;
}

function formatIndicatori(indicatori: Record<string, any>): string {
  if (!indicatori || Object.keys(indicatori).length === 0) return "\u2014";
  return Object.entries(indicatori)
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ");
      if (typeof v === "boolean") return `${label}: ${v ? "Si" : "No"}`;
      return `${label}: ${v}`;
    })
    .join(", ");
}

/** Look up a static adaptation action by ID (e.g. "A1") */
function findStaticAzione(azioneId: string): AzioneAdattamento | null {
  const found = AZIONI_ADATTAMENTO_DATI.find((a) => a.id === azioneId);
  if (!found) return null;
  return {
    id: found.id,
    titolo: found.titolo,
    descrizione: found.descrizione ?? null,
    pericoli_climatici: [...found.pericoli_climatici],
    settori: [...found.settori],
    obiettivi: [...found.obiettivi],
    periodo_inizio: found.periodo_inizio ?? null,
    periodo_fine: found.periodo_fine ?? null,
  };
}

export default async function AzioneDettaglioPage({
  params,
}: {
  params: Promise<{ azioneId: string }>;
}) {
  const { azioneId } = await params;
  const supabase = await createClient();

  /* ---------------------------------------------------------------- */
  /*  Try Supabase first                                               */
  /* ---------------------------------------------------------------- */
  const { data: dbAzione } = await supabase
    .from("azioni_adattamento")
    .select("*")
    .eq("id", azioneId)
    .single<AzioneAdattamento>();

  /* ---------------------------------------------------------------- */
  /*  Fall back to static constants when DB has no data                 */
  /* ---------------------------------------------------------------- */
  const azione: AzioneAdattamento | null = dbAzione ?? findStaticAzione(azioneId);

  if (!azione) notFound();

  /* Aggiornamenti (only from DB) */
  const { data: aggiornamenti } = await supabase
    .from("aggiornamenti_adattamento")
    .select("*")
    .eq("azione_id", azioneId)
    .order("data_aggiornamento", { ascending: false })
    .returns<AggiornamentoAdattamento[]>();

  const latest = aggiornamenti?.[0] ?? null;
  const hasMonitoring = !!latest;
  const stato = latest?.stato ?? "non_avviata";
  const statoLabel =
    stato === "non_avviata" ? "Da avviare" : getStatoLabel(stato);
  const statoColor =
    stato === "non_avviata"
      ? "bg-slate-100 text-slate-500"
      : getStatoColor(stato);
  const pct = latest?.percentuale_completamento ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/dashboard/adattamento"
          className="transition-colors hover:text-slate-900"
        >
          Adattamento
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">
          {azione.id} \u2014 {azione.titolo}
        </span>
      </nav>

      {/* Header */}
      <div
        className="rounded-xl border bg-white p-5 shadow-sm"
        style={{ borderLeftWidth: 4, borderLeftColor: "#06b6d4" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
              <span className="mr-2 text-cyan-600">{azione.id}</span>
              {azione.titolo}
            </h1>
            {azione.descrizione && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                {azione.descrizione}
              </p>
            )}
            {(azione.periodo_inizio || azione.periodo_fine) && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  Periodo: {azione.periodo_inizio ?? "\u2014"} \u2013{" "}
                  {azione.periodo_fine ?? "\u2014"}
                </span>
              </div>
            )}
          </div>
          <Link href={`/dashboard/adattamento/${azione.id}/aggiorna`}>
            <Button className="shrink-0 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Inserisci aggiornamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stato */}
        <Card size="sm" className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-normal text-slate-400">
              Stato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={cn("border-0", statoColor)}>{statoLabel}</Badge>
          </CardContent>
        </Card>

        {/* Completamento */}
        <Card size="sm" className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-normal text-slate-400">
              Completamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <span className="text-xl font-semibold tabular-nums text-slate-900">
              {pct}%
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Periodo */}
        <Card size="sm" className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-normal text-slate-400">
              Periodo previsto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-medium text-slate-900">
              {azione.periodo_inizio ?? "\u2014"} \u2013{" "}
              {azione.periodo_fine ?? "\u2014"}
            </span>
          </CardContent>
        </Card>

        {/* Investimento */}
        <Card size="sm" className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-normal text-slate-400">
              Investimento effettivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-medium text-slate-900">
              {formatCurrency(latest?.investimento_effettivo)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Badges: Pericoli, Settori, Obiettivi */}
      <div className="grid gap-4 sm:grid-cols-3">
        {azione.pericoli_climatici.length > 0 && (
          <Card size="sm" className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-normal text-slate-400">
                Pericoli climatici
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {azione.pericoli_climatici.map((p) => (
                  <Badge
                    key={p}
                    className="border-0 bg-amber-50 text-amber-700"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {azione.settori.length > 0 && (
          <Card size="sm" className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-normal text-slate-400">
                Settori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {azione.settori.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="border-slate-200 text-slate-600"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {azione.obiettivi.length > 0 && (
          <Card size="sm" className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-normal text-slate-400">
                Obiettivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {azione.obiettivi.map((o) => (
                  <Badge
                    key={o}
                    className="border-0 bg-blue-50 text-blue-700"
                  >
                    {o}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Indicatori (from latest aggiornamento) */}
      {latest &&
        latest.indicatori &&
        Object.keys(latest.indicatori).length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Indicatori attuali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(latest.indicatori).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-400">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {typeof value === "boolean"
                        ? value
                          ? "Si"
                          : "No"
                        : String(value ?? "\u2014")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <Separator className="bg-slate-200" />

      {/* Storico aggiornamenti */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Storico aggiornamenti
        </h2>
        {!aggiornamenti || aggiornamenti.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50">
                  <Info className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Nessun aggiornamento inserito
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Aggiungi il primo aggiornamento per iniziare il monitoraggio
                  di questa azione.
                </p>
                <Link
                  href={`/dashboard/adattamento/${azione.id}/aggiorna`}
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
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-500">Data</TableHead>
                    <TableHead className="text-slate-500">Stato</TableHead>
                    <TableHead className="text-slate-500">%</TableHead>
                    <TableHead className="text-slate-500">
                      Indicatori
                    </TableHead>
                    <TableHead className="text-slate-500">Note</TableHead>
                    <TableHead className="text-slate-500">
                      Operatore
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggiornamenti.map((agg) => (
                    <TableRow
                      key={agg.id}
                      className="border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="font-medium tabular-nums text-slate-700">
                        {new Date(
                          agg.data_aggiornamento
                        ).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border-0",
                            getStatoColor(agg.stato)
                          )}
                        >
                          {getStatoLabel(agg.stato)}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums text-slate-700">
                        {agg.percentuale_completamento}%
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-xs text-slate-400">
                        {formatIndicatori(agg.indicatori)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-500">
                        {agg.note || "\u2014"}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {agg.operatore || "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
