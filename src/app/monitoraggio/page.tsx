import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PauseCircle,
  FileText,
  Flame,
  Shield,
  ArrowRight,
} from "lucide-react";
import type {
  AzioneMitigazione,
  AggiornamentoMitigazione,
  AzioneAdattamento,
  AggiornamentoAdattamento,
  Macrotema,
} from "@/lib/supabase/types";
import { AZIONI_ADATTAMENTO_DATI } from "@/lib/constants";

// ── Helpers ──────────────────────────────────────────────────────────

const statoConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  completato: { label: "Completato", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  in_corso: { label: "In corso", color: "bg-amber-100 text-amber-700", icon: Clock },
  pianificato: { label: "Pianificato", color: "bg-gray-100 text-gray-600", icon: FileText },
  sospeso: { label: "Sospeso", color: "bg-red-100 text-red-700", icon: PauseCircle },
};

function StatoBadge({ stato }: { stato: string }) {
  const cfg = statoConfig[stato] ?? statoConfig.pianificato;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function MonitoraggioPage() {
  const supabase = await createClient();

  // Auth check (redundant with middleware, but safe)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all data
  const [
    { data: macrotemi },
    { data: azioniMit },
    { data: aggiornMit },
    { data: azioniAd },
    { data: aggiornAd },
  ] = await Promise.all([
    supabase.from("macrotemi").select("*").order("numero"),
    supabase.from("azioni_mitigazione").select("*").order("titolo"),
    supabase.from("aggiornamenti_mitigazione").select("*").order("data_aggiornamento", { ascending: false }),
    supabase.from("azioni_adattamento").select("*").order("titolo"),
    supabase.from("aggiornamenti_adattamento").select("*").order("data_aggiornamento", { ascending: false }),
  ]);

  const mitActions = (azioniMit ?? []) as AzioneMitigazione[];
  const adActionsDb = (azioniAd ?? []) as AzioneAdattamento[];
  // Fall back to constants data if no adattamento actions in database
  const adActions: AzioneAdattamento[] =
    adActionsDb.length > 0
      ? adActionsDb
      : AZIONI_ADATTAMENTO_DATI.map((a) => ({
          ...a,
          descrizione: a.descrizione ?? null,
          periodo_inizio: a.periodo_inizio ?? null,
          periodo_fine: a.periodo_fine ?? null,
          pericoli_climatici: [...a.pericoli_climatici],
          settori: [...a.settori],
          obiettivi: [...a.obiettivi],
        }));
  const mitUpdates = (aggiornMit ?? []) as AggiornamentoMitigazione[];
  const adUpdates = (aggiornAd ?? []) as AggiornamentoAdattamento[];
  const macrotemiList = (macrotemi ?? []) as Macrotema[];

  // Build latest update map for mitigazione
  const latestMitUpdate = new Map<string, AggiornamentoMitigazione>();
  for (const u of mitUpdates) {
    if (!latestMitUpdate.has(u.azione_id)) {
      latestMitUpdate.set(u.azione_id, u);
    }
  }

  // Build latest update map for adattamento
  const latestAdUpdate = new Map<string, AggiornamentoAdattamento>();
  for (const u of adUpdates) {
    if (!latestAdUpdate.has(u.azione_id)) {
      latestAdUpdate.set(u.azione_id, u);
    }
  }

  // Build macrotema label map
  const macrotemaLabels = new Map<string, string>();
  for (const m of macrotemiList) {
    macrotemaLabels.set(m.id, m.label);
  }

  // Stats
  const totalMit = mitActions.length;
  const totalAd = adActions.length;
  const totalActions = totalMit + totalAd;

  const mitWithUpdate = mitActions.filter((a) => latestMitUpdate.has(a.id)).length;
  const adWithUpdate = adActions.filter((a) => latestAdUpdate.has(a.id)).length;
  const totalUpdated = mitWithUpdate + adWithUpdate;

  const allUpdates = [
    ...mitActions.map((a) => latestMitUpdate.get(a.id)),
    ...adActions.map((a) => latestAdUpdate.get(a.id)),
  ];
  const needsAttention = allUpdates.filter((u) => {
    if (!u) return true; // no update at all
    if (u.stato === "sospeso") return true;
    return false;
  }).length;

  const completedCount = allUpdates.filter(
    (u) => u && u.stato === "completato"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Monitoraggio
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestisci e aggiorna lo stato di avanzamento delle azioni PAESC.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">
            {totalActions}
          </div>
          <p className="mt-1 text-sm text-gray-500">Azioni totali</p>
          <p className="text-xs text-gray-400">
            {totalMit} mitigazione + {totalAd} adattamento
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-emerald-600">
            {totalUpdated}
          </div>
          <p className="mt-1 text-sm text-gray-500">Con aggiornamenti</p>
          <p className="text-xs text-gray-400">
            su {totalActions} totali
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-emerald-600">
            {completedCount}
          </div>
          <p className="mt-1 text-sm text-gray-500">Completate</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">
            {needsAttention}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Richiedono attenzione
          </p>
          <p className="text-xs text-gray-400">
            Senza aggiornamento o sospese
          </p>
        </div>
      </div>

      {/* Mitigazione table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Flame className="h-5 w-5 text-emerald-600" />
            Azioni di Mitigazione ({totalMit})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="min-w-[250px]">Azione</TableHead>
                <TableHead>Macrotema</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Completamento</TableHead>
                <TableHead className="text-right">Ultimo agg.</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mitActions.map((azione) => {
                const update = latestMitUpdate.get(azione.id);
                return (
                  <TableRow key={azione.id} className="border-gray-200 transition-colors hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {azione.titolo}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {macrotemaLabels.get(azione.macrotema_id) ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      {update ? (
                        <StatoBadge stato={update.stato} />
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">
                          Nessun dato
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {update
                        ? `${update.percentuale_completamento}%`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {update
                        ? new Date(
                            update.data_aggiornamento
                          ).toLocaleDateString("it-IT")
                        : "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/mitigazione/${azione.id}/aggiorna`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        Aggiorna
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {mitActions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                    <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
                    Nessuna azione di mitigazione trovata
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Adattamento table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5 text-emerald-600" />
            Azioni di Adattamento ({totalAd})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="min-w-[250px]">Azione</TableHead>
                <TableHead>Settori</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Completamento</TableHead>
                <TableHead className="text-right">Ultimo agg.</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adActions.map((azione) => {
                const update = latestAdUpdate.get(azione.id);
                return (
                  <TableRow key={azione.id} className="border-gray-200 transition-colors hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {azione.titolo}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {azione.settori?.join(", ") ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      {update ? (
                        <StatoBadge stato={update.stato} />
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">
                          Nessun dato
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {update
                        ? `${update.percentuale_completamento}%`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {update
                        ? new Date(
                            update.data_aggiornamento
                          ).toLocaleDateString("it-IT")
                        : "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/adattamento/${azione.id}/aggiorna`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        Aggiorna
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {adActions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                    <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
                    Nessuna azione di adattamento trovata
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
