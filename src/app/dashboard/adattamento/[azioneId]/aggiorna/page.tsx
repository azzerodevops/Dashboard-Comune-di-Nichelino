"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AzioneAdattamento } from "@/lib/supabase/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Save,
  Loader2,
  ClipboardCheck,
  Gauge,
  StickyNote,
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { STATI_AZIONE } from "@/lib/constants";

/* ── Steps ─────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Stato", icon: ClipboardCheck, desc: "Data, stato e avanzamento" },
  { id: 2, label: "Indicatori", icon: Gauge, desc: "Indicatori specifici dell'azione" },
  { id: 3, label: "Conferma", icon: StickyNote, desc: "Note e invio finale" },
];

/* ── Dynamic indicators per action ─────────────────────────── */
const INDICATORI_PER_AZIONE: Record<
  string,
  { key: string; label: string; type: "number" | "text" | "boolean" }[]
> = {
  A1: [
    { key: "piano_aggiornato", label: "Piano aggiornato", type: "boolean" },
    { key: "data_aggiornamento_piano", label: "Data aggiornamento piano", type: "text" },
    { key: "esercitazioni_anno", label: "N. esercitazioni/anno", type: "number" },
  ],
  A2: [
    { key: "pratiche_con_allegato", label: "N. pratiche con allegato", type: "number" },
    { key: "mq_incentivati", label: "m\u00B2 incentivati", type: "number" },
  ],
  A3: [
    { key: "pannelli_installati", label: "N. pannelli installati", type: "number" },
    { key: "alert_inviati_anno", label: "N. alert inviati/anno", type: "number" },
    { key: "cittadini_raggiunti", label: "Cittadini raggiunti", type: "number" },
  ],
  A4: [
    { key: "stazioni_attive", label: "N. stazioni attive", type: "number" },
    { key: "alert_istituzionali_anno", label: "N. alert istituzionali/anno", type: "number" },
  ],
  A5: [
    { key: "eventi_anno", label: "N. eventi/anno", type: "number" },
    { key: "partecipanti_totali", label: "Partecipanti totali", type: "number" },
    { key: "scuole_coinvolte", label: "Scuole coinvolte", type: "number" },
  ],
  A6: [
    { key: "km_messi_in_sicurezza", label: "km messi in sicurezza", type: "number" },
    { key: "euro_investiti", label: "\u20AC investiti", type: "number" },
  ],
  A7: [
    { key: "km_alveo_manutenzionato", label: "km alveo manutenzionato", type: "number" },
    { key: "mc_vegetazione_rimossa", label: "m\u00B3 vegetazione rimossa", type: "number" },
  ],
  A8: [
    { key: "alberi_piantati", label: "N. alberi piantati", type: "number" },
    { key: "mq_verde_creati", label: "m\u00B2 verde creati", type: "number" },
    { key: "pct_specie_autoctone", label: "% specie autoctone", type: "number" },
  ],
  A9: [
    { key: "variante_prg_adottata", label: "Variante PRG adottata", type: "boolean" },
    { key: "mq_de_impermeabilizzati", label: "m\u00B2 de-impermeabilizzati", type: "number" },
  ],
  A10: [
    { key: "trattamenti_anno", label: "N. trattamenti/anno", type: "number" },
    { key: "kmq_zona_coperta", label: "km\u00B2 zona coperta", type: "number" },
    { key: "segnalazioni", label: "N. segnalazioni", type: "number" },
  ],
  A11: [
    { key: "mq_rinaturalizzati", label: "m\u00B2 rinaturalizzati", type: "number" },
    { key: "pct_specie_invasive_rimosse", label: "% specie invasive rimosse", type: "number" },
  ],
  A12: [
    { key: "euro_richiesti", label: "\u20AC richiesti", type: "number" },
    { key: "euro_ottenuti", label: "\u20AC ottenuti", type: "number" },
    { key: "stato_bando", label: "Stato bando", type: "text" },
  ],
  A13: [
    { key: "aziende_coinvolte", label: "N. aziende coinvolte", type: "number" },
    { key: "ha_gestiti", label: "ha gestiti", type: "number" },
    { key: "tecniche_adottate", label: "Tecniche adottate", type: "text" },
  ],
};

export default function AggiornamentoPage() {
  const params = useParams<{ azioneId: string }>();
  const router = useRouter();
  const azioneId = params.azioneId;
  const [azione, setAzione] = useState<AzioneAdattamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Form fields
  const [dataAggiornamento, setDataAggiornamento] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [stato, setStato] = useState<string>("pianificato");
  const [percentuale, setPercentuale] = useState(0);
  const [investimento, setInvestimento] = useState("");
  const [note, setNote] = useState("");
  const [operatore, setOperatore] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [indicatoriValues, setIndicatoriValues] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("azioni_adattamento")
        .select("*")
        .eq("id", azioneId)
        .single<AzioneAdattamento>();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Azione non trovata");
      } else {
        setAzione(data);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [azioneId]);

  const indicatoriDef = INDICATORI_PER_AZIONE[azioneId] ?? [];
  const hasIndicators = indicatoriDef.length > 0;
  const totalSteps = hasIndicators ? 3 : 2;
  const activeSteps = hasIndicators ? STEPS : [STEPS[0], STEPS[2]];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleIndicatorChange = (key: string, value: any) => {
    setIndicatoriValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indicatori: Record<string, any> = {};
    for (const def of indicatoriDef) {
      const val = indicatoriValues[def.key];
      if (val === undefined || val === "" || val === null) continue;
      if (def.type === "number") {
        indicatori[def.key] = Number(val);
      } else if (def.type === "boolean") {
        indicatori[def.key] = val === true || val === "true";
      } else {
        indicatori[def.key] = val;
      }
    }

    const supabase = createClient();
    const { error } = await supabase.from("aggiornamenti_adattamento").insert({
      azione_id: azioneId,
      data_aggiornamento: dataAggiornamento,
      stato,
      percentuale_completamento: percentuale,
      investimento_effettivo: investimento ? Number(investimento) : null,
      indicatori,
      note: note || null,
      operatore: operatore || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Errore durante il salvataggio", { description: error.message });
    } else {
      toast.success("Aggiornamento inserito con successo!");
      router.push(`/dashboard/adattamento/${azioneId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!azione) {
    return (
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/dashboard/adattamento" className="transition-colors hover:text-teal-600">
            Adattamento
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-900">Azione non trovata</span>
        </nav>
        <p className="text-slate-500">L&apos;azione richiesta non esiste.</p>
      </div>
    );
  }

  // Map logical step to display step
  const isLastStep = step === totalSteps;
  const isConfirmStep = isLastStep;
  const isIndicatorsStep = hasIndicators && step === 2;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Protected badge */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
        <Lock className="h-3.5 w-3.5" />
        Area riservata — Solo operatori autorizzati possono inserire dati
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/dashboard/adattamento" className="transition-colors hover:text-teal-600">
          Adattamento
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/dashboard/adattamento/${azioneId}`}
          className="transition-colors hover:text-teal-600"
        >
          {azione.id} — {azione.titolo}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">Nuovo aggiornamento</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Inserisci aggiornamento
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          <span className="font-semibold text-teal-600">{azione.id}</span> — {azione.titolo}
        </p>
      </div>

      {/* ── Step Progress ─────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          {activeSteps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => isDone && setStep(stepNum)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                      : isDone
                        ? "cursor-pointer text-teal-600 hover:bg-teal-50/50"
                        : "text-slate-400"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-teal-600 text-white"
                        : isDone
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < activeSteps.length - 1 && (
                  <div
                    className={`mx-1 h-px flex-1 ${
                      step > stepNum ? "bg-teal-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          {activeSteps[step - 1]?.desc}
        </p>
      </div>

      {/* ── Step 1: Stato ─────────────────────────────────────── */}
      {step === 1 && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ClipboardCheck className="h-5 w-5 text-teal-600" />
              Stato dell&apos;azione
            </CardTitle>
            <CardDescription>
              Indica la data, lo stato e l&apos;avanzamento dell&apos;azione di adattamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-1.5">
                  Data aggiornamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={dataAggiornamento}
                  onChange={(e) => setDataAggiornamento(e.target.value)}
                  required
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
                <p className="text-xs text-slate-400">Data del rilevamento</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stato" className="flex items-center gap-1.5">
                  Stato <span className="text-red-500">*</span>
                </Label>
                <select
                  id="stato"
                  value={stato}
                  onChange={(e) => setStato(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors outline-none focus-visible:border-teal-500 focus-visible:ring-3 focus-visible:ring-teal-500/20"
                  required
                >
                  {STATI_AZIONE.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Pianificato, In corso, Completato o Sospeso</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pct" className="flex items-center gap-1.5">
                Percentuale completamento <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pct"
                  type="range"
                  min={0}
                  max={100}
                  value={percentuale}
                  onChange={(e) => setPercentuale(Number(e.target.value))}
                  className="h-2 flex-1 accent-teal-600"
                />
                <span className="w-14 rounded-lg bg-teal-50 px-2 py-1 text-center text-sm font-bold tabular-nums text-teal-700">
                  {percentuale}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${percentuale}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investimento">Investimento effettivo (&euro;)</Label>
              <Input
                id="investimento"
                type="number"
                min={0}
                step="0.01"
                placeholder="Opzionale"
                value={investimento}
                onChange={(e) => setInvestimento(e.target.value)}
                className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
              />
              <p className="text-xs text-slate-400">Spesa effettiva sostenuta</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Indicatori (only if action has indicators) ── */}
      {isIndicatorsStep && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Gauge className="h-5 w-5 text-teal-600" />
              Indicatori specifici — {azione.id}
            </CardTitle>
            <CardDescription>
              Indicatori di monitoraggio specifici per questa azione di adattamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-lg bg-teal-50/50 p-3 text-sm text-teal-700 ring-1 ring-teal-100">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Compila solo i campi per cui hai dati disponibili. I campi vuoti
                  verranno ignorati nel salvataggio.
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {indicatoriDef.map((ind) => (
                <div key={ind.key} className="space-y-1.5">
                  <Label htmlFor={ind.key} className="text-xs font-medium">
                    {ind.label}
                  </Label>
                  {ind.type === "boolean" ? (
                    <select
                      id={ind.key}
                      value={
                        indicatoriValues[ind.key] === undefined
                          ? ""
                          : String(indicatoriValues[ind.key])
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        handleIndicatorChange(
                          ind.key,
                          v === "" ? undefined : v === "true",
                        );
                      }}
                      className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors outline-none focus-visible:border-teal-500 focus-visible:ring-3 focus-visible:ring-teal-500/20"
                    >
                      <option value="">— Seleziona —</option>
                      <option value="true">Si</option>
                      <option value="false">No</option>
                    </select>
                  ) : ind.type === "number" ? (
                    <Input
                      id={ind.key}
                      type="number"
                      step="any"
                      placeholder="—"
                      value={indicatoriValues[ind.key] ?? ""}
                      onChange={(e) => handleIndicatorChange(ind.key, e.target.value)}
                      className="h-9 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                    />
                  ) : (
                    <Input
                      id={ind.key}
                      type="text"
                      placeholder="—"
                      value={indicatoriValues[ind.key] ?? ""}
                      onChange={(e) => handleIndicatorChange(ind.key, e.target.value)}
                      className="h-9 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Last Step: Conferma ───────────────────────────────── */}
      {isConfirmStep && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <StickyNote className="h-5 w-5 text-teal-600" />
              Note e conferma
            </CardTitle>
            <CardDescription>
              Verifica i dati e aggiungi eventuali note prima di inviare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Riepilogo */}
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Riepilogo dati inseriti
              </h4>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Data</span>
                  <span className="font-medium text-slate-900">{dataAggiornamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stato</span>
                  <span className="font-medium text-slate-900">
                    {STATI_AZIONE.find((s) => s.value === stato)?.label ?? stato}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completamento</span>
                  <span className="font-bold text-teal-600">{percentuale}%</span>
                </div>
                {investimento && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Investimento</span>
                    <span className="font-medium text-slate-900">&euro; {investimento}</span>
                  </div>
                )}
                {Object.keys(indicatoriValues).filter((k) => indicatoriValues[k] !== undefined && indicatoriValues[k] !== "").length > 0 && (
                  <div className="col-span-2 mt-1 border-t border-slate-200 pt-2">
                    <span className="text-xs font-medium text-slate-500">
                      {Object.keys(indicatoriValues).filter((k) => indicatoriValues[k] !== undefined && indicatoriValues[k] !== "").length} indicatori compilati
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note aggiuntive</Label>
              <Textarea
                id="note"
                placeholder="Note aggiuntive..."
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatore">Operatore</Label>
              <Input
                id="operatore"
                type="text"
                placeholder="Nome dell'operatore che compila"
                value={operatore}
                onChange={(e) => setOperatore(e.target.value)}
                className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
              />
              <p className="text-xs text-slate-400">
                Il nome verr&agrave; registrato insieme all&apos;aggiornamento
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Navigation buttons ────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </Button>
          ) : (
            <Link href={`/dashboard/adattamento/${azioneId}`}>
              <Button type="button" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Annulla
              </Button>
            </Link>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Passaggio {step} di {totalSteps}
        </div>

        <div>
          {!isLastStep ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              className="gap-1.5 bg-teal-600 text-white hover:bg-teal-700"
            >
              Avanti
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salva aggiornamento
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
