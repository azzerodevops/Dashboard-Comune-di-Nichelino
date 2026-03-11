"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Camera,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { ProfiloUtente, KpiSnapshot } from "@/lib/supabase/types";

const RUOLI = ["admin", "operatore", "lettore"] as const;

const RUOLO_BADGE_VARIANT: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  operatore: "bg-blue-100 text-blue-700",
  lettore: "bg-slate-100 text-slate-600",
};

interface AdminPanelProps {
  profili: ProfiloUtente[];
}

export function AdminPanel({ profili: initialProfili }: AdminPanelProps) {
  const supabase = useMemo(() => createClient(), []);

  const [profili, setProfili] = useState<ProfiloUtente[]>(initialProfili);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<KpiSnapshot[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(true);
  const [generatingSnapshot, setGeneratingSnapshot] = useState(false);

  // Fetch KPI snapshots
  const fetchSnapshots = useCallback(async () => {
    setLoadingSnapshots(true);
    const { data, error } = await supabase
      .from("kpi_snapshot")
      .select("*")
      .order("data_snapshot", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Errore nel caricamento degli snapshot KPI");
    } else {
      setSnapshots(data as KpiSnapshot[]);
    }
    setLoadingSnapshots(false);
  }, [supabase]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  // Handle role change
  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingUserId(userId);

    const { error } = await supabase
      .from("profili_utenti")
      .update({ ruolo: newRole })
      .eq("id", userId);

    if (error) {
      toast.error("Errore nell'aggiornamento del ruolo");
    } else {
      setProfili((prev) =>
        prev.map((p) =>
          p.id === userId
            ? { ...p, ruolo: newRole as ProfiloUtente["ruolo"] }
            : p
        )
      );
      toast.success("Ruolo aggiornato con successo");
    }

    setUpdatingUserId(null);
  }

  // Generate KPI snapshot
  async function handleGenerateSnapshot() {
    setGeneratingSnapshot(true);

    try {
      const res = await fetch("/api/kpi-snapshot", { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Errore nella generazione dello snapshot");
      }

      toast.success("Snapshot KPI generato con successo");
      await fetchSnapshots();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Errore nella generazione dello snapshot"
      );
    }

    setGeneratingSnapshot(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Pannello Amministrazione
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestione utenti e snapshot KPI
        </p>
      </div>

      {/* Users Section */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Gestione Utenti
            </CardTitle>
          </div>
          <CardDescription className="text-slate-500">
            {profili.length} utenti registrati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cognome</TableHead>
                <TableHead>Servizio</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Modifica Ruolo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profili.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nessun utente trovato
                  </TableCell>
                </TableRow>
              ) : (
                profili.map((utente) => (
                  <TableRow key={utente.id}>
                    <TableCell className="font-medium text-slate-900">
                      {utente.nome}
                    </TableCell>
                    <TableCell className="text-slate-700">{utente.cognome}</TableCell>
                    <TableCell className="text-slate-500">
                      {utente.servizio ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${RUOLO_BADGE_VARIANT[utente.ruolo] ?? ""}`}
                      >
                        {utente.ruolo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={utente.ruolo}
                          onValueChange={(val) =>
                            handleRoleChange(utente.id, val as string)
                          }
                          disabled={updatingUserId === utente.id}
                        >
                          <SelectTrigger size="sm" className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RUOLI.map((ruolo) => (
                              <SelectItem key={ruolo} value={ruolo}>
                                {ruolo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updatingUserId === utente.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      {/* KPI Snapshots Section */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Snapshot KPI
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSnapshots}
                disabled={loadingSnapshots}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingSnapshots ? "animate-spin" : ""}`}
                />
                Aggiorna
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleGenerateSnapshot}
                disabled={generatingSnapshot}
              >
                {generatingSnapshot ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                Genera Snapshot KPI
              </Button>
            </div>
          </div>
          <CardDescription className="text-slate-500">
            Storico snapshot dei principali indicatori di monitoraggio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSnapshots ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Caricamento snapshot...
            </div>
          ) : snapshots.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nessuno snapshot disponibile. Genera il primo snapshot per
              iniziare il monitoraggio.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">
                    tCO&#8322; ridotte
                  </TableHead>
                  <TableHead className="text-right">% Riduzione</TableHead>
                  <TableHead className="text-right">
                    Azioni completate
                  </TableHead>
                  <TableHead className="text-right">Investimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((snap) => (
                  <TableRow key={snap.id}>
                    <TableCell className="font-medium text-slate-900">
                      {new Date(snap.data_snapshot).toLocaleDateString(
                        "it-IT",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(snap.tco2_ridotte_totali)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(snap.pct_riduzione_effettiva)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {snap.azioni_mit_completate ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(snap.investimento_totale_attivato)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
