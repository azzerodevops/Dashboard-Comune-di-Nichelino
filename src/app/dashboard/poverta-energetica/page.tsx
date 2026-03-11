import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Wallet,
  UserRound,
  Home,
  GraduationCap,
  HeartPulse,
  Thermometer,
  Building2,
  Sun,
  Users,
  Factory,
  ShoppingCart,
  Tractor,
  Briefcase,
  TrendingDown,
} from "lucide-react";
import GraficoRedditi from "@/components/charts/GraficoRedditi";
import GraficoDemografia from "@/components/charts/GraficoDemografia";

/* ─── DATI COSTANTI ─── */

const KPI_VULNERABILITY = [
  {
    label: "Reddito pro-capite",
    valore: "16.917 €/anno",
    nota: "ULTIMO tra i comuni >20.000 ab.",
    icon: Wallet,
    color: "bg-red-100 text-red-700",
    iconColor: "text-red-600",
  },
  {
    label: "Indice di vecchiaia",
    valore: "224",
    nota: "224 anziani ogni 100 giovani",
    icon: UserRound,
    color: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-600",
  },
  {
    label: "Classi energetiche E-F-G",
    valore: "~62%",
    nota: "delle abitazioni totali",
    icon: Thermometer,
    color: "bg-orange-100 text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    label: "Di cui F e G",
    valore: "33,77%",
    nota: "Classi più energivore",
    icon: Home,
    color: "bg-rose-100 text-rose-700",
    iconColor: "text-rose-600",
  },
  {
    label: "Laureati",
    valore: "15,8%",
    nota: "vs 28,6% CM Torino",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    label: "Popolazione fragile",
    valore: ">29%",
    nota: "<5 o >65 anni",
    icon: HeartPulse,
    color: "bg-pink-100 text-pink-700",
    iconColor: "text-pink-600",
  },
];

const REDDITI = [
  { comune: "Moncalieri", reddito: 21368 },
  { comune: "Ivrea", reddito: 21151 },
  { comune: "Rivoli", reddito: 21068 },
  { comune: "Torino", reddito: 20927 },
  { comune: "Collegno", reddito: 20690 },
  { comune: "San Mauro T.", reddito: 20541 },
  { comune: "Chieri", reddito: 19698 },
  { comune: "Pinerolo", reddito: 19634 },
  { comune: "Grugliasco", reddito: 19553 },
  { comune: "Chivasso", reddito: 19308 },
  { comune: "Venaria Reale", reddito: 19228 },
  { comune: "Orbassano", reddito: 18781 },
  { comune: "Settimo T.", reddito: 17996 },
  { comune: "Carmagnola", reddito: 17930 },
  { comune: "Nichelino", reddito: 16917 },
];

const PARCO_EDILIZIO_PRIMARIO = [
  { label: "Abitazioni totali", valore: "22.367" },
  { label: "Abitazioni occupate", valore: "20.273" },
  { label: "Edifici residenziali", valore: "3.863" },
];

const PARCO_EDILIZIO_SECONDARIO = [
  { label: "Cemento armato", valore: "86%" },
  { label: "Inutilizzo", valore: "9,3%" },
  { label: "Età media", valore: "~45 anni" },
  { label: "Superficie media", valore: "79,08 m²" },
];

const EPOCHE_COSTRUZIONE = [
  { epoca: "≤1918", edifici: 71, evidenziato: false },
  { epoca: "1919-1945", edifici: 267, evidenziato: false },
  { epoca: "1946-1960", edifici: 1038, evidenziato: true },
  { epoca: "1961-1970", edifici: 1271, evidenziato: true },
  { epoca: "1971-1980", edifici: 405, evidenziato: true },
  { epoca: "1981-1990", edifici: 170, evidenziato: false },
  { epoca: "1991-2000", edifici: 271, evidenziato: false },
  { epoca: "2001-2005", edifici: 205, evidenziato: false },
  { epoca: "≥2006", edifici: 165, evidenziato: false },
];

const DEMOGRAFIA = [
  { anno: 2001, popolazione: 47898, nuclei: 20442, comp_famiglia: 2.53 },
  { anno: 2002, popolazione: 47693, nuclei: 20530, comp_famiglia: 2.50 },
  { anno: 2003, popolazione: 47545, nuclei: 20621, comp_famiglia: 2.48 },
  { anno: 2004, popolazione: 47487, nuclei: 20723, comp_famiglia: 2.46 },
  { anno: 2005, popolazione: 47360, nuclei: 20757, comp_famiglia: 2.45 },
  { anno: 2006, popolazione: 47478, nuclei: 20880, comp_famiglia: 2.44 },
  { anno: 2007, popolazione: 47717, nuclei: 21033, comp_famiglia: 2.42 },
  { anno: 2008, popolazione: 47800, nuclei: 21116, comp_famiglia: 2.41 },
  { anno: 2009, popolazione: 48040, nuclei: 21321, comp_famiglia: 2.39 },
  { anno: 2010, popolazione: 48148, nuclei: 21476, comp_famiglia: 2.38 },
  { anno: 2011, popolazione: 48070, nuclei: 21504, comp_famiglia: 2.37 },
  { anno: 2012, popolazione: 47721, nuclei: 21130, comp_famiglia: 2.36 },
  { anno: 2013, popolazione: 47598, nuclei: 21159, comp_famiglia: 2.35 },
  { anno: 2014, popolazione: 47280, nuclei: 21108, comp_famiglia: 2.33 },
  { anno: 2015, popolazione: 47056, nuclei: 21037, comp_famiglia: 2.32 },
  { anno: 2016, popolazione: 46866, nuclei: 20989, comp_famiglia: 2.31 },
  { anno: 2017, popolazione: 46705, nuclei: 20946, comp_famiglia: 2.30 },
  { anno: 2018, popolazione: 46543, nuclei: 20893, comp_famiglia: 2.29 },
  { anno: 2019, popolazione: 46350, nuclei: 20841, comp_famiglia: 2.28 },
  { anno: 2020, popolazione: 46149, nuclei: 20780, comp_famiglia: 2.27 },
  { anno: 2021, popolazione: 46071, nuclei: 20700, comp_famiglia: 2.25 },
  { anno: 2022, popolazione: 46040, nuclei: 20650, comp_famiglia: 2.23 },
  { anno: 2023, popolazione: 46006, nuclei: 20600, comp_famiglia: 2.21 },
];

const ISTRUZIONE = [
  { livello: "Laurea", nichelino: "15,8%", cmTorino: "28,6%", piemonte: "25,3%" },
  { livello: "Diploma", nichelino: "52,5%", cmTorino: "66,3%", piemonte: "62,7%" },
];

const CONTESTO_ECONOMICO = [
  { label: "Addetti", valore: "19.288", icon: Briefcase, color: "bg-teal-100 text-teal-700" },
  { label: "Terziario", valore: "50,8%", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-700" },
  { label: "Industriale", valore: "27,1%", icon: Factory, color: "bg-slate-100 text-slate-700" },
  { label: "Commercio", valore: "20,9%", icon: ShoppingCart, color: "bg-violet-100 text-violet-700" },
  { label: "Agricoltura", valore: "0,7%", icon: Tractor, color: "bg-lime-100 text-lime-700" },
];

const ERP_PROJECTS = [
  {
    indirizzo: "CIT Nichelino",
    intervento: "Riqualificazione involucro",
    strumento: "EPC + fondi regionali",
  },
  {
    indirizzo: "Via Amendola 32-34",
    intervento: "Sostituzione impianti",
    strumento: "Superbonus 110%",
  },
  {
    indirizzo: "Via Pio La Torre 7",
    intervento: "Illuminazione + isolamento",
    strumento: "Superbonus 110%",
  },
];

const DIRETTRICI = [
  {
    titolo: "Efficienza energetica strutture",
    descrizione:
      "Interventi di riqualificazione energetica sugli edifici residenziali e pubblici, con priorità agli immobili ERP e alle classi energetiche peggiori (F-G).",
    icon: Building2,
    color: "bg-teal-100 text-teal-700",
  },
  {
    titolo: "Autoproduzione FER (CER)",
    descrizione:
      "Creazione di Comunità Energetiche Rinnovabili per l'autoproduzione e condivisione di energia da fonti rinnovabili, con benefici diretti sulle famiglie in povertà energetica.",
    icon: Sun,
    color: "bg-amber-100 text-amber-700",
  },
  {
    titolo: "Comportamenti virtuosi",
    descrizione:
      "Campagne di sensibilizzazione e formazione per promuovere comportamenti di risparmio energetico e ridurre i consumi delle famiglie più vulnerabili.",
    icon: Users,
    color: "bg-green-100 text-green-700",
  },
];

/* ─── HELPER ─── */

const maxEdifici = Math.max(...EPOCHE_COSTRUZIONE.map((e) => e.edifici));

/* ─── PAGE COMPONENT ─── */

export default function PovertaEnergeticaPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Povert&agrave; Energetica e Vulnerabilit&agrave; Sociale
        </h1>
        <p className="mt-1 text-slate-500">
          Indicatori socio-economici, demografici e strutturali del Comune di Nichelino &mdash; Analisi delle fragilit&agrave; per il PAESC
        </p>
      </div>

      {/* ── Section 1: KPI Vulnerability Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_VULNERABILITY.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`rounded-lg p-2.5 ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.valore}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{kpi.nota}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Section 2: Confronto Redditi ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Confronto Redditi Pro-Capite &mdash; Comuni CM Torino (&gt;20.000 ab.)
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Reddito imponibile pro-capite annuo. <span className="font-medium text-red-600">Nichelino</span> evidenziato in rosso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraficoRedditi data={REDDITI} />
        </CardContent>
      </Card>

      {/* ── Section 3: Parco Edilizio ── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Parco Edilizio</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PARCO_EDILIZIO_PRIMARIO.map((d) => (
            <Card key={d.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {d.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{d.valore}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PARCO_EDILIZIO_SECONDARIO.map((d) => (
            <Card key={d.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {d.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">{d.valore}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Section 4: Distribuzione Edifici per Epoca ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Distribuzione Edifici per Epoca di Costruzione
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Totale 3.863 edifici residenziali. Le barre in ambra indicano il periodo 1946-1980 (70,2% del totale).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {EPOCHE_COSTRUZIONE.map((e) => (
              <div key={e.epoca} className="flex items-center gap-3">
                <span className="w-24 text-right text-sm font-medium text-slate-600">
                  {e.epoca}
                </span>
                <div className="flex-1">
                  <div
                    className={`h-7 rounded ${
                      e.evidenziato ? "bg-amber-400" : "bg-teal-300"
                    } flex items-center`}
                    style={{ width: `${(e.edifici / maxEdifici) * 100}%`, minWidth: "2rem" }}
                  >
                    <span className="px-2 text-xs font-semibold text-slate-800">
                      {e.edifici.toLocaleString("it-IT")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>70,2%</strong> degli edifici costruiti prima delle normative sull&apos;isolamento termico (1946-1980).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Demografia ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Andamento Demografico 2001&ndash;2023
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Popolazione residente (barre) e componenti medi per famiglia (linea). Popolazione in calo da 47.898 a 46.006, nuclei stabili (~20.500), dimensione familiare in riduzione (da 2,53 a 2,21).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraficoDemografia data={DEMOGRAFIA} />
        </CardContent>
      </Card>

      {/* ── Section 6: Istruzione ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Livello di Istruzione &mdash; Confronto Territoriale
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Percentuale di popolazione con titolo di studio superiore. Nichelino significativamente sotto la media metropolitana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Livello</TableHead>
                <TableHead className="text-right text-slate-600">Nichelino</TableHead>
                <TableHead className="text-right text-slate-600">CM Torino</TableHead>
                <TableHead className="text-right text-slate-600">Piemonte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ISTRUZIONE.map((row) => (
                <TableRow key={row.livello}>
                  <TableCell className="font-medium text-slate-900">{row.livello}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    {row.nichelino}
                  </TableCell>
                  <TableCell className="text-right text-slate-700">{row.cmTorino}</TableCell>
                  <TableCell className="text-right text-slate-700">{row.piemonte}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Section 7: Contesto Economico ── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Contesto Economico</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CONTESTO_ECONOMICO.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center gap-2 p-5">
                  <div className={`rounded-lg p-2 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900">{item.valore}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-3 border border-gray-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">
              <strong>Nota:</strong> La presenza dei centri commerciali &quot;I Viali Shopping Park&quot; e &quot;Mondojuve Shopping Village&quot; determina un <strong>+109,6%</strong> delle emissioni del settore terziario rispetto alla media dei comuni di dimensioni comparabili.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 8: Progetti ERP ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Interventi su Edilizia Residenziale Pubblica (ERP)
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Progetti di riqualificazione energetica sugli edifici di edilizia popolare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Indirizzo</TableHead>
                <TableHead className="text-slate-600">Intervento</TableHead>
                <TableHead className="text-slate-600">Strumento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ERP_PROJECTS.map((p) => (
                <TableRow key={p.indirizzo}>
                  <TableCell className="font-medium text-slate-900">{p.indirizzo}</TableCell>
                  <TableCell className="text-slate-700">{p.intervento}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-600">
                      {p.strumento}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Section 9: Tre Direttrici Strategiche ── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Tre Direttrici Strategiche contro la Povert&agrave; Energetica
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {DIRETTRICI.map((d) => {
            const Icon = d.icon;
            return (
              <Card
                key={d.titolo}
                className="border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className={`rounded-xl p-4 ${d.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{d.titolo}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{d.descrizione}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Fonte dati ── */}
      <Card className="border border-gray-200 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-slate-600">
            <strong>Fonte dati:</strong> ISTAT, MEF, Regione Piemonte, CENED, Anagrafe comunale. Elaborazioni per il PAESC di Nichelino.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
