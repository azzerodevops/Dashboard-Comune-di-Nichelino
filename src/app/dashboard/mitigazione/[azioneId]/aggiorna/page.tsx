"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STATI_AZIONE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronRight,
  Loader2,
  ClipboardCheck,
  BarChart3,
  Gauge,
  StickyNote,
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Lock,
} from "lucide-react";

/* ── Steps Definition ─────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Stato", icon: ClipboardCheck, desc: "Data e stato dell'azione" },
  { id: 2, label: "Risultati", icon: BarChart3, desc: "Dati energetici e CO₂" },
  { id: 3, label: "Indicatori", icon: Gauge, desc: "Indicatori tecnici specifici" },
  { id: 4, label: "Conferma", icon: StickyNote, desc: "Note e invio" },
];

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function AggiornaPage() {
  const params = useParams<{ azioneId: string }>();
  const router = useRouter();
  const azioneId = params.azioneId;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [dataAggiornamento, setDataAggiornamento] = useState(todayISO());
  const [stato, setStato] = useState<string>("pianificato");
  const [percentuale, setPercentuale] = useState<number>(0);
  const [tco2Effettive, setTco2Effettive] = useState("");
  const [mwhTermici, setMwhTermici] = useState("");
  const [mwhElettrici, setMwhElettrici] = useState("");
  const [investimentoEffettivo, setInvestimentoEffettivo] = useState("");

  // Specific indicators
  const [kwInstallati, setKwInstallati] = useState("");
  const [mqRiqualificati, setMqRiqualificati] = useState("");
  const [unitaTrattate, setUnitaTrattate] = useState("");
  const [kmRealizzati, setKmRealizzati] = useState("");
  const [puntiLuceSostituiti, setPuntiLuceSostituiti] = useState("");
  const [impiantiSostituiti, setImpiantiSostituiti] = useState("");
  const [mcAllacciati, setMcAllacciati] = useState("");
  const [mwhProdotti, setMwhProdotti] = useState("");
  const [mwhAcquistatiVerdi, setMwhAcquistatiVerdi] = useState("");
  const [classeEnergeticaPre, setClasseEnergeticaPre] = useState("");
  const [classeEnergeticaPost, setClasseEnergeticaPost] = useState("");

  const [note, setNote] = useState("");
  const [operatore, setOperatore] = useState("");

  function parseOptionalNumber(val: string): number | null {
    if (val.trim() === "") return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  function canProceed(): boolean {
    if (step === 1) return !!dataAggiornamento && !!stato;
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        azione_id: azioneId,
        data_aggiornamento: dataAggiornamento,
        stato,
        percentuale_completamento: percentuale,
        tco2_effettive: parseOptionalNumber(tco2Effettive),
        mwh_termici_effettivi: parseOptionalNumber(mwhTermici),
        mwh_elettrici_effettivi: parseOptionalNumber(mwhElettrici),
        investimento_effettivo: parseOptionalNumber(investimentoEffettivo),
        kw_installati: parseOptionalNumber(kwInstallati),
        mq_riqualificati: parseOptionalNumber(mqRiqualificati),
        unita_trattate: parseOptionalNumber(unitaTrattate),
        km_realizzati: parseOptionalNumber(kmRealizzati),
        punti_luce_sostituiti: parseOptionalNumber(puntiLuceSostituiti),
        impianti_sostituiti: parseOptionalNumber(impiantiSostituiti),
        mc_allacciati: parseOptionalNumber(mcAllacciati),
        mwh_prodotti: parseOptionalNumber(mwhProdotti),
        mwh_acquistati_verdi: parseOptionalNumber(mwhAcquistatiVerdi),
        classe_energetica_pre: classeEnergeticaPre.trim() || null,
        classe_energetica_post: classeEnergeticaPost.trim() || null,
        note: note.trim() || null,
        operatore: operatore.trim() || null,
      };

      const { error } = await supabase
        .from("aggiornamenti_mitigazione")
        .insert(payload);

      if (error) {
        toast.error("Errore durante il salvataggio: " + error.message);
        return;
      }

      toast.success("Aggiornamento inserito con successo!");
      router.push(`/dashboard/mitigazione/${azioneId}`);
    } catch {
      toast.error("Errore imprevisto durante il salvataggio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Protected badge */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
        <Lock className="h-3.5 w-3.5" />
        Area riservata — Solo operatori autorizzati possono inserire dati
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/dashboard/mitigazione" className="transition-colors hover:text-teal-600">
          Mitigazione
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/dashboard/mitigazione/${azioneId}`}
          className="transition-colors hover:text-teal-600"
        >
          {azioneId}
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
          Azione <span className="font-semibold text-teal-600">{azioneId}</span> — Segui i passaggi per compilare correttamente
        </p>
      </div>

      {/* ── Step Progress Bar ─────────────────────────────────── */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => isDone && setStep(s.id)}
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
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-px flex-1 ${
                      step > s.id ? "bg-teal-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          {STEPS[step - 1].desc}
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
              Indica la data e lo stato attuale di avanzamento dell&apos;azione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_aggiornamento" className="flex items-center gap-1.5">
                  Data aggiornamento
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="data_aggiornamento"
                  type="date"
                  value={dataAggiornamento}
                  onChange={(e) => setDataAggiornamento(e.target.value)}
                  required
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
                <p className="text-xs text-slate-400">
                  Data in cui viene effettuato il rilevamento
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Stato <span className="text-red-500">*</span>
                </Label>
                <Select value={stato} onValueChange={(v) => v && setStato(v)}>
                  <SelectTrigger className="w-full focus:ring-teal-500/30 focus:border-teal-500">
                    <SelectValue placeholder="Seleziona stato" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATI_AZIONE.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Pianificato, In corso, Completato o Sospeso
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentuale" className="flex items-center gap-1.5">
                Percentuale completamento
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="percentuale"
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
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Risultati ─────────────────────────────────── */}
      {step === 2 && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Risultati energetici
            </CardTitle>
            <CardDescription>
              Inserisci i dati misurati di riduzione emissioni, energia e investimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-lg bg-teal-50/50 p-3 text-sm text-teal-700 ring-1 ring-teal-100">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Compila solo i campi per cui hai dati disponibili. I campi vuoti
                  verranno ignorati.
                </span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tco2_effettive">
                  tCO&#8322; ridotte effettive
                </Label>
                <Input
                  id="tco2_effettive"
                  type="number"
                  step="any"
                  placeholder="Es. 150"
                  value={tco2Effettive}
                  onChange={(e) => setTco2Effettive(e.target.value)}
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
                <p className="text-xs text-slate-400">
                  Tonnellate di CO₂ equivalenti effettivamente ridotte
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investimento_effettivo">
                  Investimento effettivo (&euro;)
                </Label>
                <Input
                  id="investimento_effettivo"
                  type="number"
                  step="any"
                  placeholder="Es. 50000"
                  value={investimentoEffettivo}
                  onChange={(e) => setInvestimentoEffettivo(e.target.value)}
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
                <p className="text-xs text-slate-400">
                  Spesa effettiva sostenuta per l&apos;azione
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mwh_termici">MWh termici risparmiati</Label>
                <Input
                  id="mwh_termici"
                  type="number"
                  step="any"
                  placeholder="Opzionale"
                  value={mwhTermici}
                  onChange={(e) => setMwhTermici(e.target.value)}
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mwh_elettrici">MWh elettrici risparmiati</Label>
                <Input
                  id="mwh_elettrici"
                  type="number"
                  step="any"
                  placeholder="Opzionale"
                  value={mwhElettrici}
                  onChange={(e) => setMwhElettrici(e.target.value)}
                  className="focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Indicatori specifici ──────────────────────── */}
      {step === 3 && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Gauge className="h-5 w-5 text-teal-600" />
              Indicatori tecnici specifici
            </CardTitle>
            <CardDescription>
              Campi opzionali — compila solo quelli pertinenti al tipo di azione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-lg bg-amber-50/60 p-3 text-sm text-amber-700 ring-1 ring-amber-100">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Questi indicatori variano in base al tipo di azione. Se non hai dati
                  per un campo, lascialo vuoto e vai avanti.
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "kw_installati", label: "kW installati", val: kwInstallati, set: setKwInstallati },
                { id: "mq_riqualificati", label: "m² riqualificati", val: mqRiqualificati, set: setMqRiqualificati },
                { id: "unita_trattate", label: "Unita trattate", val: unitaTrattate, set: setUnitaTrattate },
                { id: "km_realizzati", label: "km realizzati", val: kmRealizzati, set: setKmRealizzati },
                { id: "punti_luce", label: "Punti luce sostituiti", val: puntiLuceSostituiti, set: setPuntiLuceSostituiti },
                { id: "impianti", label: "Impianti sostituiti", val: impiantiSostituiti, set: setImpiantiSostituiti },
                { id: "mc_allacciati", label: "mc allacciati", val: mcAllacciati, set: setMcAllacciati },
                { id: "mwh_prodotti", label: "MWh prodotti", val: mwhProdotti, set: setMwhProdotti },
                { id: "mwh_verdi", label: "MWh acquistati verdi", val: mwhAcquistatiVerdi, set: setMwhAcquistatiVerdi },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id} className="text-xs">
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type="number"
                    step="any"
                    placeholder="—"
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    className="h-9 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="classe_pre" className="text-xs">Classe energetica PRE</Label>
                <Input
                  id="classe_pre"
                  type="text"
                  placeholder="Es. G"
                  value={classeEnergeticaPre}
                  onChange={(e) => setClasseEnergeticaPre(e.target.value)}
                  className="h-9 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="classe_post" className="text-xs">Classe energetica POST</Label>
                <Input
                  id="classe_post"
                  type="text"
                  placeholder="Es. C"
                  value={classeEnergeticaPost}
                  onChange={(e) => setClasseEnergeticaPost(e.target.value)}
                  className="h-9 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Conferma ──────────────────────────────────── */}
      {step === 4 && (
        <Card className="border-0 bg-white shadow-md ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <StickyNote className="h-5 w-5 text-teal-600" />
              Note e conferma
            </CardTitle>
            <CardDescription>
              Aggiungi note e verifica prima di inviare
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
                {tco2Effettive && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">tCO₂ ridotte</span>
                    <span className="font-medium text-slate-900">{tco2Effettive}</span>
                  </div>
                )}
                {investimentoEffettivo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Investimento</span>
                    <span className="font-medium text-slate-900">&euro; {investimentoEffettivo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note aggiuntive</Label>
              <Textarea
                id="note"
                placeholder="Eventuali osservazioni sull'aggiornamento..."
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
            <Link href={`/dashboard/mitigazione/${azioneId}`}>
              <Button type="button" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Annulla
              </Button>
            </Link>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Passaggio {step} di {STEPS.length}
        </div>

        <div>
          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-1.5 bg-teal-600 text-white hover:bg-teal-700"
            >
              Avanti
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
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
