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
  MapPin,
  Droplets,
  TreePine,
  Building2,
  Mountain,
  AlertTriangle,
  Globe,
  Compass,
  Ruler,
  ArrowUp,
  Users,
  Thermometer,
  Waves,
  Landmark,
  Shield,
  Bike,
  Train,
  Car,
  Droplet,
  Home,
  BrickWall,
  CalendarClock,
  Leaf,
  BookOpen,
  Info,
  Download,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  GraficoCoperturaSuolo,
  GraficoEpocheCostruzione,
  GraficoErosione,
} from "@/components/charts/GraficoCoperturaSuolo";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const INQUADRAMENTO = [
  { label: "Regione", valore: "Piemonte", icon: Globe, color: "text-teal-600", bg: "bg-teal-50", accent: "border-teal-200" },
  { label: "Provincia", valore: "Torino (CM)", icon: Compass, color: "text-teal-700", bg: "bg-teal-50", accent: "border-teal-200" },
  { label: "Superficie", valore: "20,62 km\u00B2", sotto: "2.060,60 ha", icon: Ruler, color: "text-emerald-600", bg: "bg-emerald-50", accent: "border-emerald-200" },
  { label: "Altitudine", valore: "229 m", sotto: "s.l.m.", icon: ArrowUp, color: "text-amber-600", bg: "bg-amber-50", accent: "border-amber-200" },
  { label: "Densit\u00E0", valore: "2.232", sotto: "ab/km\u00B2", icon: Users, color: "text-rose-600", bg: "bg-rose-50", accent: "border-rose-200" },
  { label: "Zona climatica", valore: "E", sotto: "GG 2.617", icon: Thermometer, color: "text-cyan-600", bg: "bg-cyan-50", accent: "border-cyan-200" },
];

type MappaTheme = {
  id: string;
  titolo: string;
  descrizione: string;
  file: string;
  icon: LucideIcon;
  colorFrom: string;
  colorTo: string;
  iconColor: string;
  dati: { label: string; valore: string; evidenza?: boolean }[];
  note?: string;
};

const MAPPE: MappaTheme[] = [
  {
    id: "confini",
    titolo: "Confini Comunali",
    descrizione: "Limiti amministrativi del Comune di Nichelino e inquadramento nella Citt\u00E0 Metropolitana di Torino. Il territorio si estende nella pianura a sud di Torino.",
    file: "/maps/confini.pdf",
    icon: MapPin,
    colorFrom: "from-teal-500",
    colorTo: "to-teal-700",
    iconColor: "text-teal-100",
    dati: [
      { label: "Comuni confinanti", valore: "6" },
      { label: "Perimetro comunale", valore: "~22 km" },
      { label: "Confine nord", valore: "Torino" },
      { label: "Confine sud", valore: "Candiolo / Vinovo" },
    ],
    note: "Posizione strategica nella prima cintura metropolitana, lungo la direttrice Torino-Pinerolo.",
  },
  {
    id: "copertura-urbana",
    titolo: "Copertura Suolo Urbana",
    descrizione: "Classificazione Corine Land Cover delle aree urbanizzate. Il territorio mostra un elevato grado di artificializzazione, concentrato nel settore nord-orientale.",
    file: "/maps/copertura-urbana.pdf",
    icon: Building2,
    colorFrom: "from-purple-500",
    colorTo: "to-purple-700",
    iconColor: "text-purple-100",
    dati: [
      { label: "Tessuto urbano discontinuo", valore: "465,54 ha (22,59%)", evidenza: true },
      { label: "Zone industriali/commerciali", valore: "262,23 ha (12,73%)" },
      { label: "Cantieri", valore: "24,97 ha (1,21%)" },
      { label: "Consumo di suolo 2018", valore: "752,7 ha (36,5%)", evidenza: true },
    ],
  },
  {
    id: "copertura-naturale",
    titolo: "Copertura Suolo Naturale",
    descrizione: "Classificazione Corine Land Cover delle aree naturali e agricole. Le aree verdi sono concentrate nel settore occidentale (Parco di Stupinigi) e meridionale.",
    file: "/maps/copertura-naturale.pdf",
    icon: TreePine,
    colorFrom: "from-green-500",
    colorTo: "to-green-700",
    iconColor: "text-green-100",
    dati: [
      { label: "Aree verdi urbane", valore: "332,25 ha (16,12%)", evidenza: true },
      { label: "Seminativi non irrigui", valore: "447,47 ha (21,72%)", evidenza: true },
      { label: "Sistemi colturali complessi", valore: "247,34 ha (12,00%)" },
      { label: "Boschi di latifoglie", valore: "274,31 ha (13,31%)" },
    ],
    note: "Il 63,5% del territorio \u00E8 coperto da vegetazione naturale o aree agricole.",
  },
  {
    id: "impermeabilizzazione",
    titolo: "Impermeabilizzazione del Suolo",
    descrizione: "Grado di sigillatura del suolo (Imperviousness Density, Copernicus). L\u2019elevata impermeabilizzazione riduce l\u2019infiltrazione delle acque piovane e aumenta il rischio di allagamenti.",
    file: "/maps/impermeabilizzazione.pdf",
    icon: Droplets,
    colorFrom: "from-cyan-500",
    colorTo: "to-cyan-700",
    iconColor: "text-cyan-100",
    dati: [
      { label: "Nucleo urbano centrale", valore: "Impermeabilizzazione elevata", evidenza: true },
      { label: "Aree industriali (est)", valore: "Impermeabilizzazione molto alta" },
      { label: "Settore ovest (Stupinigi)", valore: "Bassa impermeabilizzazione" },
      { label: "Effetto", valore: "Riduce ricarica falde e aumenta run-off" },
    ],
  },
  {
    id: "pericolosita-idraulica",
    titolo: "Pericolosit\u00E0 Idraulica",
    descrizione: "Aree a pericolosit\u00E0 idraulica (PAI) lungo il Torrente Sangone e il Rio Laira. Il rischio alluvionale interessa una porzione significativa della popolazione.",
    file: "/maps/pericolosita-idraulica.pdf",
    icon: AlertTriangle,
    colorFrom: "from-orange-500",
    colorTo: "to-orange-700",
    iconColor: "text-orange-100",
    dati: [
      { label: "P2 (media) \u2014 Area", valore: "2,35 km\u00B2" },
      { label: "P2 \u2014 Abitanti esposti", valore: "16.097 (34,7%)", evidenza: true },
      { label: "P3 (elevata) \u2014 Area", valore: "0,47 km\u00B2" },
      { label: "P3 \u2014 Abitanti esposti", valore: "554 (1,2%) \u2014 65 edifici", evidenza: true },
    ],
    note: "Corsi d\u2019acqua principali: Torrente Sangone (nord), Rio Laira (centro). Area P2 molto estesa.",
  },
  {
    id: "erosione",
    titolo: "Erosione del Suolo",
    descrizione: "Stima della perdita di suolo per erosione idrica secondo il modello RUSLE. Indicatore fondamentale per la pianificazione di interventi di difesa del suolo.",
    file: "/maps/erosione.pdf",
    icon: Mountain,
    colorFrom: "from-amber-500",
    colorTo: "to-amber-700",
    iconColor: "text-amber-100",
    dati: [
      { label: "Molto bassa (<2 t/ha/a)", valore: "Maggiore estensione", evidenza: true },
      { label: "Tasso < 5 t/ha/anno", valore: "~38% del territorio" },
      { label: "Tasso > 8 t/ha/anno", valore: "~5% del territorio" },
      { label: "Classi RUSLE", valore: "5 classi da molto bassa a molto alta" },
    ],
  },
];

const CORINE_TABLE = [
  { classe: "112", descrizione: "Tessuto urbano discontinuo", superficie: "465,54", percentuale: "22,59", color: "bg-purple-400" },
  { classe: "121", descrizione: "Aree industriali / commerciali", superficie: "262,23", percentuale: "12,73", color: "bg-pink-400" },
  { classe: "133", descrizione: "Cantieri", superficie: "24,97", percentuale: "1,21", color: "bg-orange-400" },
  { classe: "141", descrizione: "Aree verdi urbane", superficie: "332,25", percentuale: "16,12", color: "bg-green-400" },
  { classe: "211", descrizione: "Seminativi non irrigui", superficie: "447,47", percentuale: "21,72", color: "bg-yellow-400" },
  { classe: "242", descrizione: "Sistemi colturali complessi", superficie: "247,34", percentuale: "12,00", color: "bg-lime-400" },
  { classe: "243", descrizione: "Aree agricole con spazi naturali", superficie: "6,49", percentuale: "0,32", color: "bg-lime-300" },
  { classe: "311", descrizione: "Boschi di latifoglie", superficie: "274,31", percentuale: "13,31", color: "bg-emerald-500" },
];

const CONTESTO_NATURALE = [
  {
    titolo: "Parco Naturale di Stupinigi",
    sottotitolo: "Sito Natura 2000 \u2014 ZSC IT1110004",
    dettagli: "Oltre 130 specie protette tra flora e fauna. Area di elevato pregio naturalistico e paesaggistico, corridoio ecologico fondamentale per la biodiversit\u00E0 dell\u2019area metropolitana.",
    icon: Shield,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    titolo: "Palazzina di Caccia di Stupinigi",
    sottotitolo: "Patrimonio UNESCO dal 1997",
    dettagli: "Capolavoro dell\u2019architettura barocca di Filippo Juvarra. Polo culturale e turistico di rilevanza internazionale, inserito nel sito seriale delle Residenze Sabaude.",
    icon: Landmark,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    titolo: "Parco del Boschetto",
    sottotitolo: "Area verde urbana principale",
    dettagli: "Spazio verde di riferimento per la comunit\u00E0 di Nichelino. Funzione di socializzazione, attivit\u00E0 ricreative e servizio ecosistemico locale (isola di freschezza, assorbimento CO\u2082).",
    icon: Leaf,
    color: "text-lime-600",
    bg: "bg-lime-50",
    border: "border-lime-200",
  },
  {
    titolo: "Torrente Sangone",
    sottotitolo: "Corridoio ecologico nord",
    dettagli: "Confine settentrionale del territorio comunale. Corridoio ecologico con funzione di connessione tra aree naturali e fascia riparia importante per la biodiversit\u00E0.",
    icon: Waves,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  {
    titolo: "Boschi Planiziali",
    sottotitolo: "274,31 ha (13,31% del territorio)",
    dettagli: "Boschi di latifoglie della pianura torinese, concentrati nel settore sud-occidentale. Habitat sempre pi\u00F9 raro nella Pianura Padana, con funzione importante di sink di carbonio.",
    icon: TreePine,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
];

const INFRASTRUTTURE = [
  { tipo: "Rete stradale", dettaglio: "Tangenziale Sud (A55), SP 23, SP 140, SP 143, SP 144", icon: Car, color: "text-slate-600", bg: "bg-slate-100" },
  { tipo: "Rete ferroviaria", dettaglio: "Stazione Nichelino \u2014 linea Torino-Pinerolo (SFM)", icon: Train, color: "text-teal-600", bg: "bg-teal-50" },
  { tipo: "Rete ciclabile", dettaglio: "> 13 km pianificati nel PUMS metropolitano", icon: Bike, color: "text-green-600", bg: "bg-green-50" },
  { tipo: "Servizio idrico", dettaglio: "SMAT S.p.A.", icon: Droplet, color: "text-cyan-600", bg: "bg-cyan-50" },
];

const PARCO_EDILIZIO_STATS = [
  { label: "Abitazioni totali", valore: "22.367", icon: Home, color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Edifici residenziali", valore: "~3.863", icon: Building2, color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Edifici totali", valore: "~4.600", icon: BrickWall, color: "text-slate-600", bg: "bg-slate-100" },
  { label: "Costruiti 1946\u20131980", valore: "70,2%", icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50" },
];

/* ------------------------------------------------------------------ */
/*  SECTION HEADER                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({
  number,
  title,
  subtitle,
  color = "bg-slate-800",
}: {
  number: string;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
      >
        {number}
      </span>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function TerritorioPage() {
  return (
    <div className="space-y-12">
      {/* ============================================================ */}
      {/* 1. HERO / INTRO                                              */}
      {/* ============================================================ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Territorio e Ambiente
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Analisi del contesto territoriale, copertura del suolo, rischi naturali e patrimonio
          ambientale del Comune di Nichelino &mdash; dati fondamentali per la definizione delle
          strategie di adattamento e mitigazione del PAESC.
        </p>
      </div>

      {/* Key geographic stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {INQUADRAMENTO.map((d) => {
          const Icon = d.icon;
          return (
            <Card key={d.label} className={`border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md`}>
              <CardContent className="flex flex-col items-center p-5 text-center">
                <div className={`mb-3 rounded-xl p-2.5 ${d.bg}`}>
                  <Icon className={`h-5 w-5 ${d.color}`} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {d.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">{d.valore}</p>
                {d.sotto && (
                  <p className="text-xs text-slate-500">{d.sotto}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Neighboring municipalities + hydrography */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <MapPin className="h-5 w-5 text-slate-600" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Comuni Confinanti
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Torino", "Moncalieri", "Vinovo", "Candiolo", "Orbassano", "Beinasco"].map(
                (comune) => (
                  <Badge key={comune} variant="secondary" className="bg-slate-100 text-slate-700">
                    {comune}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-50 p-2">
                <Waves className="h-5 w-5 text-teal-600" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Idrografia
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                <span>
                  <strong className="text-slate-800">Torrente Sangone</strong> &mdash; confine
                  settentrionale del territorio comunale
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                <span>
                  <strong className="text-slate-800">Rio Laira</strong> &mdash; attraversa
                  il territorio da ovest a est
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <span>
                  <strong className="text-slate-800">Fiume Po</strong> &mdash; bacino idrografico
                  di riferimento
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* 2. THEMATIC MAP CARDS                                        */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="2"
          title="Cartografia Tematica"
          subtitle="Mappe QGIS elaborate per il PAESC \u2014 dati chiave e download PDF"
          color="bg-emerald-700"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {MAPPE.map((mappa) => {
            const Icon = mappa.icon;
            return (
              <Card
                key={mappa.id}
                className="group overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Colored header */}
                <div className="border-b border-gray-200 px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5">
                        <Icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{mappa.titolo}</h3>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  {/* Description */}
                  <p className="text-sm leading-relaxed text-slate-600">
                    {mappa.descrizione}
                  </p>

                  {/* Key data */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Dati chiave
                    </p>
                    <div className="space-y-1.5">
                      {mappa.dati.map((d, i) => (
                        <div
                          key={i}
                          className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                            d.evidenza
                              ? "bg-slate-50 font-medium"
                              : ""
                          }`}
                        >
                          <span className="text-slate-600">{d.label}</span>
                          <span className={`shrink-0 text-right ${d.evidenza ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                            {d.valore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  {mappa.note && (
                    <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <p className="text-xs leading-relaxed text-slate-500">{mappa.note}</p>
                    </div>
                  )}

                  {/* Download button */}
                  <a
                    href={mappa.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Download className="h-4 w-4" />
                    Scarica mappa PDF
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. LAND COVER DONUT CHART                                    */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="3"
          title="Copertura del Suolo"
          subtitle="Classificazione Corine Land Cover del territorio comunale"
          color="bg-purple-700"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Donut chart */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Distribuzione copertura del suolo
              </CardTitle>
              <CardDescription>
                Superficie totale: 2.060,60 ha &mdash; Interattivo: passa il mouse per i dettagli
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraficoCoperturaSuolo />
            </CardContent>
          </Card>

          {/* Table + insights */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Classi Corine Land Cover
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="font-semibold text-slate-700">Classe</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">ha</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CORINE_TABLE.map((row) => (
                      <TableRow key={row.classe}>
                        <TableCell className="pr-0">
                          <div className={`h-3 w-3 rounded-full ${row.color}`} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{row.descrizione}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-900">{row.superficie}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-900">{row.percentuale}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Insight cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-l-4 border-l-orange-400 border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-orange-50 p-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Suolo consumato (2018)</p>
                      <p className="text-xl font-extrabold text-orange-600">752,7 ha</p>
                      <p className="text-xs text-slate-500">
                        <strong className="text-slate-700">36,5%</strong> della superficie
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-400 border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-50 p-2">
                      <TreePine className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Copertura naturale</p>
                      <p className="text-xl font-extrabold text-green-600">63,5%</p>
                      <p className="text-xs text-slate-500">
                        Aree verdi, agricole e boschive
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. NATURAL CONTEXT                                           */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="4"
          title="Contesto Naturale e Patrimonio"
          subtitle="Aree protette, corridoi ecologici e beni culturali"
          color="bg-green-700"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONTESTO_NATURALE.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.titolo} className={`border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2.5 ${item.bg}`}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {item.titolo}
                      </CardTitle>
                      {item.sottotitolo && (
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {item.sottotitolo}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">{item.dettagli}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EROSION                                                   */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="5"
          title="Erosione Idrica del Suolo"
          subtitle="Classificazione RUSLE del tasso di erosione"
          color="bg-amber-700"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Distribuzione classi di erosione
              </CardTitle>
              <CardDescription>
                Modello RUSLE &mdash; stima perdita di suolo in t/ha/anno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraficoErosione />
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Erosion class badges */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Classi di erosione RUSLE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { classe: "Molto bassa", intervallo: "< 2 t/ha/anno", colore: "bg-green-100 text-green-800", barra: "bg-green-400", pct: 45 },
                    { classe: "Bassa", intervallo: "2 \u2013 5 t/ha/anno", colore: "bg-lime-100 text-lime-800", barra: "bg-lime-400", pct: 17 },
                    { classe: "Media", intervallo: "5 \u2013 8 t/ha/anno", colore: "bg-yellow-100 text-yellow-800", barra: "bg-yellow-400", pct: 15 },
                    { classe: "Alta", intervallo: "8 \u2013 12 t/ha/anno", colore: "bg-orange-100 text-orange-800", barra: "bg-orange-400", pct: 13 },
                    { classe: "Molto alta", intervallo: "> 12 t/ha/anno", colore: "bg-red-100 text-red-800", barra: "bg-red-400", pct: 10 },
                  ].map((row) => (
                    <div key={row.classe} className="flex items-center gap-3">
                      <Badge className={`${row.colore} border-0 text-xs w-24 justify-center`}>
                        {row.classe}
                      </Badge>
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${row.barra}`}
                            style={{ width: `${(row.pct / 50) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-16 text-right text-xs text-slate-500">{row.intervallo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary stats */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-l-4 border-l-green-400 border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-500">Tasso basso</p>
                  <p className="text-2xl font-extrabold text-green-600">~38%</p>
                  <p className="text-xs text-slate-500">del territorio &lt; 5 t/ha/anno</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-400 border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-500">Tasso alto</p>
                  <p className="text-2xl font-extrabold text-red-600">~5%</p>
                  <p className="text-xs text-slate-500">del territorio &gt; 8 t/ha/anno</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. BUILDING STOCK                                            */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="6"
          title="Parco Edilizio"
          subtitle="Consistenza, et\u00E0 e prestazioni energetiche del patrimonio edilizio"
          color="bg-rose-700"
        />

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PARCO_EDILIZIO_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center p-5 text-center">
                  <div className={`mb-3 rounded-xl p-2.5 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{stat.valore}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar chart */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Distribuzione per epoca di costruzione
              </CardTitle>
              <CardDescription>
                Percentuale di edifici residenziali per periodo &mdash; Fonte: ISTAT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraficoEpocheCostruzione />
            </CardContent>
          </Card>

          {/* Highlights */}
          <div className="space-y-4">
            <Card className="border-l-4 border-l-rose-400 border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-rose-50 p-2">
                    <CalendarClock className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Stock edilizio vetusto
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-rose-600">70,2%</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      degli edifici residenziali costruiti nel periodo <strong className="text-slate-800">1946&ndash;1980</strong>,
                      con prestazioni energetiche generalmente scarse e necessit&agrave; di
                      interventi di riqualificazione profonda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-50 p-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Classi energetiche basse
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-amber-600">62%</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      degli edifici residenziali in classi <strong className="text-slate-800">E, F e G</strong>.
                      Priorit&agrave; strategica per il PAESC: efficientamento dell&apos;involucro
                      e sostituzione degli impianti di riscaldamento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-slate-400 border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <BrickWall className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Struttura prevalente
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      <strong className="text-slate-800">86%</strong> degli edifici in cemento armato.
                      Prevalenza di condomini multipiano (4-8 piani) nel nucleo urbano,
                      villette e case a schiera nelle aree pi&ugrave; recenti.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. INFRASTRUCTURE TABLE                                      */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <SectionHeader
          number="7"
          title="Infrastrutture e Reti"
          subtitle="Sistema di trasporto e servizi a rete"
          color="bg-teal-700"
        />

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {INFRASTRUTTURE.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.tipo} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50">
                    <div className={`rounded-lg p-2 ${row.bg}`}>
                      <Icon className={`h-5 w-5 ${row.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{row.tipo}</p>
                      <p className="text-sm text-slate-600">{row.dettaglio}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* FOOTER NOTE                                                  */}
      {/* ============================================================ */}
      <Card className="border border-gray-200 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <BookOpen className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              <strong>Fonte:</strong> Copernicus, ISTAT, ARPA Piemonte, Regione Piemonte.
              Elaborazioni QGIS per il PAESC di Nichelino.
              Le mappe e i dati sono stati prodotti nell&apos;ambito della redazione del Piano d&apos;Azione
              per l&apos;Energia Sostenibile e il Clima del Comune di Nichelino.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
