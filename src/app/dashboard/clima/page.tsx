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
  Thermometer,
  TrendingUp,
  Wind,
  Info,
  AlertTriangle,
} from "lucide-react";
import { SERIE_TEMPERATURE, QUALITA_ARIA } from "@/lib/constants";
import GraficoTemperature from "@/components/charts/GraficoTemperature";
import GraficoQualitaAria from "@/components/charts/GraficoQualitaAria";

const INDICATORI = [
  {
    sigla: "SU25",
    nome: "Giornate estive",
    descrizione: "Giorni con T max > 25°C",
    colore: "bg-amber-50 text-amber-700",
    icona: "border-amber-200",
  },
  {
    sigla: "SU30",
    nome: "Giornate molto calde",
    descrizione: "Giorni con T max > 30°C",
    colore: "bg-orange-50 text-orange-700",
    icona: "border-orange-200",
  },
  {
    sigla: "TXx",
    nome: "Temperatura massima assoluta",
    descrizione: "Temperatura massima assoluta annuale (°C)",
    colore: "bg-red-50 text-red-700",
    icona: "border-red-200",
  },
  {
    sigla: "WSDI",
    nome: "Warm Spell Duration Index",
    descrizione: "≥6 gg consecutivi con T max > 90° percentile",
    colore: "bg-purple-50 text-purple-700",
    icona: "border-purple-200",
  },
];

const KEY_FINDINGS_TEMP = [
  {
    titolo: "SU30 in aumento",
    testo: "da ~60 gg (anni '90) a >80 gg nell'ultimo decennio",
    colore: "border-l-orange-400",
  },
  {
    titolo: "WSDI record",
    testo: "29 giorni nel 2022, superando l'eccezionale 2003 (24 gg)",
    colore: "border-l-purple-400",
  },
  {
    titolo: "Record TXx",
    testo: "42,3°C nel 2019 — frequenza crescente di massime >40°C",
    colore: "border-l-red-400",
  },
];

export default function ClimaPage() {
  // Cast readonly arrays to mutable for chart props
  const temperatureData = SERIE_TEMPERATURE.map((d) => ({ ...d }));
  const pm10Data = QUALITA_ARIA.pm10.map((d) => ({ ...d }));
  const no2Data = QUALITA_ARIA.no2.map((d) => ({ ...d }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
          <Thermometer className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Serie Climatiche e Qualita dell&apos;Aria
          </h1>
          <p className="text-sm text-slate-500">
            Stazione di riferimento: Moncalieri — Collegio Carlo Alberto (1,7
            km da Nichelino) | Periodo: 1995-2024
          </p>
        </div>
      </div>

      {/* Section 1: Indicator Explanation Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">
            Indicatori Climatici di Temperatura
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {INDICATORI.map((ind) => (
            <Card
              key={ind.sigla}
              className={`bg-white shadow-sm border ${ind.icona}`}
            >
              <CardContent className="space-y-1 pt-4">
                <Badge className={`border-0 ${ind.colore}`}>
                  {ind.sigla}
                </Badge>
                <p className="text-sm font-semibold text-slate-900">
                  {ind.nome}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {ind.descrizione}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 2: Temperature Chart */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Andamento Indicatori di Temperatura (1995-2024)
          </h2>
        </div>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-4">
            <GraficoTemperature data={temperatureData} />
          </CardContent>
        </Card>

        {/* Key Findings */}
        <div className="grid gap-3 md:grid-cols-3">
          {KEY_FINDINGS_TEMP.map((finding) => (
            <Card
              key={finding.titolo}
              className={`bg-white shadow-sm border-l-4 ${finding.colore}`}
            >
              <CardContent className="space-y-1 pt-4">
                <p className="text-sm font-semibold text-slate-900">
                  {finding.titolo}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {finding.testo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="bg-slate-200" />

      {/* Section 3: Air Quality */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Qualita dell&apos;Aria
          </h2>
          <Badge className="border-0 bg-slate-100 text-slate-600">
            2007-2023
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* PM10 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">
                PM10 — Media annuale
              </CardTitle>
              <CardDescription className="text-slate-500">
                Concentrazione media annua di particolato fine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraficoQualitaAria
                data={pm10Data}
                inquinante="PM10"
                limite={QUALITA_ARIA.limite_annuale}
              />
            </CardContent>
          </Card>

          {/* NO2 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">
                NO₂ — Media annuale
              </CardTitle>
              <CardDescription className="text-slate-500">
                Concentrazione media annua di biossido di azoto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraficoQualitaAria
                data={no2Data}
                inquinante="NO₂"
                limite={QUALITA_ARIA.limite_annuale}
              />
            </CardContent>
          </Card>
        </div>

        {/* Air Quality Key Finding */}
        <Card className="border-l-4 border-l-emerald-400 bg-white shadow-sm">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Miglioramento costante dal 2007
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                PM10 da 54 a 25,89 µg/m³ (minimo storico 2023). Entrambi gli
                inquinanti sono oggi stabilmente sotto il limite normativo di 40
                µg/m³.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
