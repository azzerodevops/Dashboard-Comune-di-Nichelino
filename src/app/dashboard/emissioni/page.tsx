import { formatNumber } from "@/lib/utils";
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
  TableFooter,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Info,
  Zap,
  Sun,
  Factory,
} from "lucide-react";
import GraficoConfrontoSettori from "@/components/charts/GraficoConfrontoSettori";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const fattoriEmissione = [
  { vettore: "Benzina", fe: "0,249" },
  { vettore: "Gasolio", fe: "0,267" },
  { vettore: "GPL", fe: "0,227" },
  { vettore: "Gas naturale", fe: "0,202" },
  { vettore: "Biomassa", fe: "0" },
  { vettore: "Elettricita nazionale", fe: "0,483" },
  { vettore: "Elettricita locale", fe: "0,473" },
  { vettore: "Teleriscaldamento", fe: "0,167" },
];

type RowIBE = {
  settore: string;
  termici: number;
  elettrici: number;
  emissioni: number;
  pct: string;
};

const ibeData: RowIBE[] = [
  { settore: "Edifici pubblici", termici: 8572, elettrici: 2211, emissioni: 2800, pct: "1,2%" },
  { settore: "Illuminazione pubblica", termici: 0, elettrici: 2234, emissioni: 1079, pct: "0,5%" },
  { settore: "Flotta municipale", termici: 176, elettrici: 0, emissioni: 45, pct: "0,02%" },
  { settore: "Trasporto pubblico", termici: 0, elettrici: 0, emissioni: 0, pct: "0%" },
  { settore: "Residenziale", termici: 261807, elettrici: 43593, emissioni: 74997, pct: "32,3%" },
  { settore: "Terziario", termici: 37762, elettrici: 22281, emissioni: 18575, pct: "8,0%" },
  { settore: "Industria", termici: 42595, elettrici: 65564, emissioni: 40552, pct: "17,5%" },
  { settore: "Mobilita privata", termici: 363313, elettrici: 0, emissioni: 92983, pct: "40,1%" },
  { settore: "Agricoltura", termici: 2705, elettrici: 484, emissioni: 955, pct: "0,4%" },
];

const ibeTotale: RowIBE = {
  settore: "TOTALE",
  termici: 716930,
  elettrici: 136367,
  emissioni: 231986,
  pct: "100%",
};

type RowIME = {
  settore: string;
  termici: number;
  elettrici: number;
  emissioni: number;
  pct: string;
};

const imeData: RowIME[] = [
  { settore: "Edifici pubblici", termici: 3250.65, elettrici: 2854.40, emissioni: 2978.49, pct: "1,57%" },
  { settore: "Illuminazione pubblica", termici: 0, elettrici: 1870.21, emissioni: 885.37, pct: "0,47%" },
  { settore: "Flotta municipale", termici: 92.06, elettrici: 0, emissioni: 23.17, pct: "0,01%" },
  { settore: "Trasporti pubblici", termici: 3680.06, elettrici: 42.55, emissioni: 943.90, pct: "0,50%" },
  { settore: "Residenziale", termici: 147665.61, elettrici: 41323.52, emissioni: 62916.90, pct: "33,24%" },
  { settore: "Terziario", termici: 54616.05, elettrici: 48149.07, emissioni: 38940.02, pct: "20,57%" },
  { settore: "Industria", termici: 28218.48, elettrici: 48674.61, emissioni: 28854.66, pct: "15,24%" },
  { settore: "Mobilita privata", termici: 206119.13, elettrici: 1067.89, emissioni: 53749.59, pct: "28,39%" },
];

const imeTotale: RowIME = {
  settore: "TOTALE",
  termici: 443642.05,
  elettrici: 143982.26,
  emissioni: 189292.10,
  pct: "100%",
};

const confrontoData = [
  { settore: "Pubblico", ibe2000: 3924, ime2021: 3887, delta_pct: -0.9 },
  { settore: "Residenziale", ibe2000: 74997, ime2021: 62917, delta_pct: -16.1 },
  { settore: "Terziario", ibe2000: 18575, ime2021: 38940, delta_pct: 109.6 },
  { settore: "Industria", ibe2000: 40552, ime2021: 28855, delta_pct: -28.8 },
  { settore: "Trasporti", ibe2000: 92983, ime2021: 54717, delta_pct: -41.2 },
];

const vettoriResidenziale = [
  { vettore: "Gas naturale", mwh: 232507, pct: "78%" },
  { vettore: "Elettricita", mwh: 43593, pct: "14,6%" },
  { vettore: "Gasolio", mwh: 16938, pct: "5,7%" },
  { vettore: "Biomassa", mwh: 3259, pct: "1,1%" },
  { vettore: "GPL", mwh: 1718, pct: "0,6%" },
];

const impiantiFER = [
  { fascia: "Fino a 3 kW", impianti: 43, kw: 94, pct: "1,5%" },
  { fascia: "3 - 20 kW", impianti: 107, kw: 751, pct: "11,7%" },
  { fascia: "Oltre 20 kW", impianti: 47, kw: 5564, pct: "86,8%" },
];

const ferTotale = { fascia: "TOTALE", impianti: 197, kw: 6409, pct: "" };

/* ------------------------------------------------------------------ */
/*  Helper: emission table                                             */
/* ------------------------------------------------------------------ */

function EmissioniTable({
  data,
  totale,
  decimals = 0,
}: {
  data: RowIBE[];
  totale: RowIBE;
  decimals?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-slate-700 font-semibold">Settore</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">
              Consumi termici [MWh]
            </TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">
              Consumi elettrici [MWh]
            </TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">
              Emissioni [tCO&#8322;]
            </TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.settore} className="hover:bg-slate-50/60">
              <TableCell className="font-medium text-slate-800">
                {row.settore}
              </TableCell>
              <TableCell className="text-right tabular-nums text-slate-600">
                {formatNumber(row.termici, decimals)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-slate-600">
                {formatNumber(row.elettrici, decimals)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-semibold text-slate-800">
                {formatNumber(row.emissioni, decimals)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-slate-500">
                {row.pct}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-slate-100 font-bold">
            <TableCell className="text-slate-900">{totale.settore}</TableCell>
            <TableCell className="text-right tabular-nums text-slate-900">
              {formatNumber(totale.termici, decimals)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-slate-900">
              {formatNumber(totale.elettrici, decimals)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-slate-900">
              {formatNumber(totale.emissioni, decimals)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-slate-900">
              {totale.pct}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function EmissioniPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Inventario delle Emissioni
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Metodologia IPCC &mdash; Confronto IBE 2000 vs IME 2021
        </p>
      </div>

      {/* ============================================================ */}
      {/* Section 1: Metodologia                                       */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Metodologia</h2>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <Info className="h-5 w-5 text-teal-500" />
              Formula di calcolo IPCC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-slate-50 px-5 py-4">
              <p className="font-mono text-sm text-slate-800">
                E<sub>i</sub> = A &times; FE<sub>i</sub>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                dove E<sub>i</sub> = emissioni in tCO&#8322;, A = consumo in MWh,
                FE<sub>i</sub> = fattore di emissione del vettore energetico
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Fattori di emissione [tCO&#8322;/MWh]
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-700 font-semibold">
                        Vettore energetico
                      </TableHead>
                      <TableHead className="text-right text-slate-700 font-semibold">
                        FE [tCO&#8322;/MWh]
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fattoriEmissione.map((row) => (
                      <TableRow key={row.vettore} className="hover:bg-slate-50/60">
                        <TableCell className="text-slate-700">{row.vettore}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-slate-800">
                          {row.fe}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">FE<sub>L</sub> locale = 0,473 tCO&#8322;/MWh</span>{" "}
                (inferiore al nazionale) grazie a 197 impianti FV locali (6.409 kW).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* Section 2: IBE 2000                                          */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          IBE 2000 &mdash; Inventario Base delle Emissioni
        </h2>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <EmissioniTable data={ibeData} totale={ibeTotale} />
          </CardContent>
        </Card>

        {/* Insight cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-red-400 bg-white shadow-sm">
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Principale fonte
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">40,1%</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Mobilita privata &mdash; principale fonte di emissioni
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-400 bg-white shadow-sm">
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Seconda fonte
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">32,3%</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Residenziale &mdash; seconda fonte
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-slate-400 bg-white shadow-sm">
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Concentrazione
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">72,4%</p>
              <p className="mt-0.5 text-sm text-slate-500">
                I primi due settori coprono il 72,4% delle emissioni
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 3: IME 2021                                          */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          IME 2021 &mdash; Inventario di Monitoraggio delle Emissioni
        </h2>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <EmissioniTable data={imeData} totale={imeTotale} decimals={2} />
          </CardContent>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* Section 4: Confronto IBE vs IME                              */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Confronto IBE 2000 vs IME 2021
        </h2>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-800">
              Emissioni per macro-settore
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Barre blu = IBE 2000 / IME 2021. Terziario evidenziato in rosso (unico settore in crescita).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoConfrontoSettori data={confrontoData} />
          </CardContent>
        </Card>

        {/* Analysis cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-white shadow-sm">
            <CardContent className="flex items-start gap-3 pt-5">
              <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Trasporti <span className="text-green-600">-41,2%</span>
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Riduzione piu significativa, rinnovo parco auto
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="flex items-start gap-3 pt-5">
              <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Industria <span className="text-green-600">-28,8%</span>
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Deindustrializzazione e efficienza
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="flex items-start gap-3 pt-5">
              <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Residenziale <span className="text-green-600">-16,1%</span>
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Efficientamento e riduzione gasolio
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-l-4 border-l-red-400">
            <CardContent className="flex items-start gap-3 pt-5">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Terziario <span className="text-red-600">+109,6%</span>
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  UNICO settore in crescita, due grandi centri commerciali
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 5: Vettori Energetici Residenziale 2000              */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Vettori Energetici &mdash; Residenziale 2000
        </h2>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">
                      Vettore
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      Consumi [MWh]
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      %
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vettoriResidenziale.map((row) => (
                    <TableRow key={row.vettore} className="hover:bg-slate-50/60">
                      <TableCell className="font-medium text-slate-700">
                        {row.vettore}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-600">
                        {formatNumber(row.mwh)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-500">
                        {row.pct}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* Section 6: Impianti FER al 2021                              */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Impianti FER al 2021
        </h2>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <Sun className="h-5 w-5 text-amber-500" />
              Fotovoltaico per fasce di potenza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">
                      Fascia
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      Impianti
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      Potenza [kW]
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      % potenza
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impiantiFER.map((row) => (
                    <TableRow key={row.fascia} className="hover:bg-slate-50/60">
                      <TableCell className="font-medium text-slate-700">
                        {row.fascia}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-600">
                        {formatNumber(row.impianti)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-600">
                        {formatNumber(row.kw)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-500">
                        {row.pct}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-slate-100 font-bold">
                    <TableCell className="text-slate-900">
                      {ferTotale.fascia}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-slate-900">
                      {formatNumber(ferTotale.impianti)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-slate-900">
                      {formatNumber(ferTotale.kw)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-slate-50 px-4 py-3">
              <Factory className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Teleriscaldamento IREN:</span>{" "}
                3.347.123 MWh elettrici, 2.041.470 MWh termici (2021).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
