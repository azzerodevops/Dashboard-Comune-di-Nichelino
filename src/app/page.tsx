"use client";

import Link from "next/link";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import {
  Building2,
  Factory,
  Car,
  Sun,
  Zap,
  Home,
  Target,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Landmark,
  Flame,
  Shield,
  Heart,
  ChevronDown,
  Leaf,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────── DATA ─────────────────────────── */

const kpis = [
  {
    value: 231_986,
    label: "Emissioni 2000 (IBE)",
    unit: "tCO\u2082",
    icon: BarChart3,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    value: 189_292,
    label: "Emissioni 2021 (IME)",
    unit: "tCO\u2082",
    icon: TrendingDown,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    value: 55.7,
    decimals: 1,
    prefix: "-",
    suffix: "%",
    label: "Riduzione prevista al 2030",
    unit: "",
    icon: Target,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    value: 46,
    label: "33 mitigazione + 13 adattamento",
    unit: "azioni",
    icon: Leaf,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const journeySteps = [
  {
    year: "2000",
    label: "IBE \u2014 Anno Base",
    tco2: 231_986,
    pct: null,
    barWidth: "100%",
    barColor: "bg-slate-300",
    style: "default" as const,
    description: "Punto di partenza",
  },
  {
    year: "2021",
    label: "IME \u2014 Monitoraggio Attuale",
    tco2: 189_292,
    pct: "-18,4%",
    barWidth: "81.6%",
    barColor: "bg-teal-400",
    style: "teal" as const,
    description: "Gi\u00e0 raggiunto",
  },
  {
    year: "2030",
    label: "Target Patto dei Sindaci (-40%)",
    tco2: 139_192,
    pct: "-40%",
    barWidth: "60%",
    barColor: "bg-amber-400",
    style: "amber" as const,
    description: "Obiettivo minimo richiesto",
  },
  {
    year: "2030",
    label: "Con PAESC \u2014 Obiettivo Reale",
    tco2: 102_358,
    pct: "-55,7%",
    barWidth: "44.1%",
    barColor: "bg-emerald-500",
    style: "highlight" as const,
    description: "Supera il target di 15,7 punti!",
  },
];

const pillars = [
  {
    icon: Flame,
    label: "Mitigazione",
    badges: ["33 azioni", "7 macrotemi"],
    stat: "86.934 tCO\u2082/anno",
    statLabel: "di riduzione prevista",
    gradient: "from-teal-500/90 to-teal-700/90",
    description:
      "Azioni concrete per ridurre le emissioni di gas serra nei settori chiave del territorio comunale.",
    href: "/dashboard/mitigazione",
  },
  {
    icon: Shield,
    label: "Adattamento",
    badges: ["13 azioni", "8 obiettivi"],
    stat: "7 rischi climatici",
    statLabel: "monitorati",
    gradient: "from-emerald-500/90 to-emerald-700/90",
    description:
      "Strategie per aumentare la resilienza del territorio agli impatti dei cambiamenti climatici.",
    href: "/dashboard/adattamento",
  },
  {
    icon: Heart,
    label: "Povert\u00e0 Energetica",
    badges: [],
    stat: "Contrasto",
    statLabel: "alla vulnerabilit\u00e0 energetica",
    gradient: "from-amber-500/90 to-orange-600/90",
    description:
      "Misure per contrastare la povert\u00e0 energetica e garantire l\u2019accesso equo all\u2019energia per tutti i cittadini.",
    href: "/dashboard",
  },
];

const macrotemi = [
  { n: 1, label: "Settore Pubblico", icon: Landmark, tco2: 589, pct: 0.68, color: "#3b82f6" },
  { n: 2, label: "Residenziale", icon: Home, tco2: 18_015, pct: 20.72, color: "#f59e0b" },
  { n: 3, label: "Terziario", icon: Building2, tco2: 7_606, pct: 8.75, color: "#8b5cf6" },
  { n: 4, label: "Industria", icon: Factory, tco2: 3_030, pct: 3.49, color: "#ef4444" },
  { n: 5, label: "Trasporti", icon: Car, tco2: 18_772, pct: 21.59, color: "#06b6d4" },
  { n: 6, label: "Produzione FER", icon: Sun, tco2: 20_186, pct: 23.22, color: "#22c55e" },
  { n: 7, label: "Energia Verde", icon: Zap, tco2: 18_737, pct: 21.55, color: "#84cc16" },
];

const TOTAL_TCO2 = macrotemi.reduce((s, m) => s + m.tco2, 0);
const MAX_PCT = Math.max(...macrotemi.map((m) => m.pct));

/* ─────────────────────────── HELPERS ─────────────────────────── */

function AnimatedCounter({
  end,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  end: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <span ref={ref}>
      {inView ? (
        <CountUp
          end={end}
          decimals={decimals}
          duration={duration}
          separator="."
          decimal=","
          prefix={prefix}
          suffix={suffix}
        />
      ) : (
        <span>
          {prefix}0{suffix}
        </span>
      )}
    </span>
  );
}

function fmtNum(n: number): string {
  return n.toLocaleString("it-IT");
}

/* ─────────────────────────── ANIMATION VARIANTS ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ─────────────────────────── STYLE MAPS ─────────────────────────── */

const yearBadgeStyles: Record<string, string> = {
  default: "bg-slate-200 text-slate-600",
  teal: "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
  highlight: "bg-emerald-600 text-white",
};

const labelStyles: Record<string, string> = {
  default: "text-slate-400",
  teal: "text-teal-500",
  amber: "text-amber-600",
  highlight: "text-emerald-600",
};

const numberStyles: Record<string, string> = {
  default: "text-slate-800",
  teal: "text-teal-700",
  amber: "text-amber-700",
  highlight: "text-emerald-700 text-4xl font-black",
};

const unitStyles: Record<string, string> = {
  default: "text-slate-400",
  teal: "text-teal-400",
  amber: "text-amber-400",
  highlight: "text-emerald-400",
};

const pctBadgeStyles: Record<string, string> = {
  teal: "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
  highlight: "bg-emerald-600 text-white text-lg px-5 py-1.5",
};

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth">
      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/stemma-nichelino.jpg"
              alt="Stemma Nichelino"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              PAESC Nichelino 2030
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Esplora il Dashboard
          </Link>
        </div>
      </header>

      {/* ══════════════ SECTION 1: IMAGE HERO ══════════════ */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <img
          src="/piazza-nichelino.jpg"
          alt="Piazza di Nichelino"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="mb-6 flex justify-center">
              <img
                src="/stemma-nichelino.jpg"
                alt="Stemma Citt\u00e0 di Nichelino"
                className="h-20 w-20 rounded-full border-[3px] border-white/80 object-cover shadow-2xl ring-4 ring-white/20"
              />
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/80 sm:text-sm">
              Citt&agrave; di Nichelino
            </p>

            <h1 className="mt-4 text-7xl font-black leading-none tracking-tight text-white sm:text-8xl lg:text-9xl">
              PAESC 2030
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg font-light text-white/70 sm:text-xl">
              Piano d&apos;Azione per l&apos;Energia Sostenibile e il Clima
            </p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-xl transition-all hover:shadow-2xl"
              >
                Esplora il Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-medium text-white transition-all hover:border-white/70 hover:bg-white/5"
              >
                Area Monitoraggio
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <a
            href="#numeri"
            className="flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white/70"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scopri</span>
            <ChevronDown className="h-5 w-5" />
          </a>
        </motion.div>
      </section>

      {/* ══════════════ SECTION 2: KEY NUMBERS ══════════════ */}
      <section id="numeri" className="bg-gradient-to-b from-emerald-50/50 to-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              I numeri chiave
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Il piano in sintesi
            </h2>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {kpis.map((kpi) => (
              <motion.div key={kpi.label} variants={staggerChild}>
                <Card className="h-full rounded-2xl border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}
                    >
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <p className={`text-4xl font-black tabular-nums tracking-tight ${kpi.color}`}>
                      <AnimatedCounter
                        end={kpi.value}
                        decimals={kpi.decimals ?? 0}
                        prefix={kpi.prefix ?? ""}
                        suffix={kpi.suffix ?? ""}
                      />
                    </p>
                    {kpi.unit && (
                      <p className="mt-0.5 text-sm text-slate-400">{kpi.unit}</p>
                    )}
                    <p className="mt-2 text-sm font-medium text-slate-600">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ SECTION 3: EMISSIONS JOURNEY ══════════════ */}
      <section className="bg-gradient-to-b from-white via-teal-50/30 to-emerald-50/40 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              Percorso di decarbonizzazione
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Il percorso verso la neutralit&agrave; climatica
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Dalla baseline 2000 all&apos;obiettivo 2030: il cammino di Nichelino verso un futuro
              sostenibile.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 space-y-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {journeySteps.map((step, i) => {
              const s = step.style;
              const isHighlight = s === "highlight";
              const isAmber = s === "amber";

              return (
                <motion.div
                  key={step.label}
                  variants={staggerChild}
                  className={`rounded-2xl border p-6 transition-shadow hover:shadow-md ${
                    isHighlight
                      ? "border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md ring-2 ring-emerald-200/40"
                      : isAmber
                        ? "border-2 border-dashed border-amber-300 bg-amber-50/40"
                        : "border-gray-200 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-black ${yearBadgeStyles[s]}`}
                      >
                        {step.year}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${labelStyles[s]}`}
                        >
                          {step.label}
                        </p>
                        <p className={`mt-1 text-3xl font-bold tabular-nums ${numberStyles[s]}`}>
                          <AnimatedCounter end={step.tco2} />{" "}
                          <span className={`text-lg font-normal ${unitStyles[s]}`}>
                            tCO&#x2082;
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {step.pct && (
                        <Badge
                          className={`px-4 py-1 text-base ${pctBadgeStyles[s] ?? ""}`}
                        >
                          {step.pct}
                        </Badge>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isHighlight ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {step.description}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-4 w-full overflow-hidden rounded-full bg-slate-100 ${
                      isHighlight ? "h-4" : "h-3"
                    }`}
                  >
                    <motion.div
                      className={`h-full rounded-full ${step.barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: step.barWidth }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 + i * 0.1 }}
                    />
                  </div>

                  {isHighlight && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3">
                      <p className="text-sm text-emerald-800">
                        Supera il target del Patto dei Sindaci di{" "}
                        <strong>15,7 punti percentuali</strong>.
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ SECTION 4: THREE PILLARS ══════════════ */}
      <section className="bg-gradient-to-br from-emerald-900 to-teal-900 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-emerald-300/60">
              Misura. Riduci. Adatta.
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              I tre pilastri del PAESC
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-200/50">
              Il Piano si articola in tre ambiti strategici complementari per affrontare la sfida
              climatica a livello locale.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {pillars.map((p) => (
              <motion.div key={p.label} variants={staggerChild}>
                <Link href={p.href} className="group block h-full">
                  <div
                    className={`relative h-full overflow-hidden rounded-2xl bg-gradient-to-br ${p.gradient} p-8 backdrop-blur-sm transition-shadow hover:shadow-2xl`}
                  >
                    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <p.icon className="h-6 w-6 text-white" />
                      </div>

                      <h3 className="mt-5 text-xl font-bold text-white">{p.label}</h3>

                      {p.badges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.badges.map((b) => (
                            <Badge
                              key={b}
                              className="border-white/20 bg-white/10 text-xs text-white hover:bg-white/20"
                            >
                              {b}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-lg font-bold text-white">{p.stat}</p>
                        <p className="text-xs text-white/50">{p.statLabel}</p>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-white/70">
                        {p.description}
                      </p>

                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-all group-hover:gap-3 group-hover:text-white">
                        Scopri di pi&ugrave;
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ SECTION 4b: TERRITORY VIDEO ══════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] sm:h-[480px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/piazza-nichelino.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/nichelino-drone.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
            <motion.div
              className="mx-auto max-w-6xl"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-sm font-medium uppercase tracking-widest text-white/60">
                Il nostro territorio
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Nichelino, Città Metropolitana di Torino
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                <span>46.006 abitanti</span>
                <span className="text-white/30">·</span>
                <span>20,62 km²</span>
                <span className="text-white/30">·</span>
                <span>229 m s.l.m.</span>
                <span className="text-white/30">·</span>
                <span>Zona climatica E</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 5: SEVEN MACROTEMI ══════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge className="mb-4 border-gray-200 bg-slate-50 text-slate-600 hover:bg-slate-50">
              33 azioni di mitigazione
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              I 7 Macrotemi
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Le azioni di mitigazione organizzate per settore e il loro contributo alla riduzione
              totale di <strong className="text-slate-700">{fmtNum(TOTAL_TCO2)} tCO&#x2082;/anno</strong>.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {macrotemi.map((m) => {
              const barPct = (m.pct / MAX_PCT) * 100;
              return (
                <motion.div
                  key={m.n}
                  variants={staggerChild}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-3 sm:w-48 sm:flex-shrink-0">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${m.color}12` }}
                      >
                        <m.icon className="h-5 w-5" style={{ color: m.color }} />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Macrotema {m.n}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="h-7 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="flex h-full items-center rounded-full px-3"
                          style={{ backgroundColor: m.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max(barPct, 8)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.08 * m.n }}
                        >
                          <span className="whitespace-nowrap text-[11px] font-semibold text-white drop-shadow-sm">
                            {m.pct.toFixed(1)}%
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    <div className="text-right sm:w-40 sm:flex-shrink-0">
                      <p className="text-base font-bold tabular-nums" style={{ color: m.color }}>
                        <AnimatedCounter end={m.tco2} />{" "}
                        <span className="text-sm font-normal text-slate-400">tCO&#x2082;/a</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Total row */}
            <motion.div
              variants={staggerChild}
              className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-base font-bold text-emerald-800">Totale riduzione</p>
                </div>
                <p className="text-2xl font-black tabular-nums text-emerald-700">
                  <AnimatedCounter end={TOTAL_TCO2} />{" "}
                  <span className="text-base font-normal text-emerald-500">tCO&#x2082;/anno</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ SECTION 6: FOOTER ══════════════ */}
      <footer className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/stemma-nichelino.jpg"
                  alt="Stemma Nichelino"
                  className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Comune di Nichelino</p>
                  <p className="text-xs text-slate-400">Citt&agrave; Metropolitana di Torino</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Patto dei Sindaci per il Clima e l&apos;Energia
                <br />
                Delibera del Consiglio Comunale n. 42 del 20/07/2010
                <br />
                Piano d&apos;Azione per l&apos;Energia Sostenibile e il Clima
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Redazione tecnica
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="/logos/azzeroco2.svg"
                  alt="AzzeroCO2"
                  className="h-7 brightness-0 invert opacity-60"
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">AzzeroCO2 S.r.l.</p>
              <p className="mt-1 text-xs text-slate-600">UNI 11352, ISO 9001, ISO 14001</p>
              <p className="mt-1 text-xs text-slate-600">Pubblicato dicembre 2025</p>
            </div>

            {/* Column 3 */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dashboard
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { href: "/dashboard", label: "Panoramica" },
                  { href: "/dashboard/mitigazione", label: "Mitigazione" },
                  { href: "/dashboard/adattamento", label: "Adattamento" },
                  { href: "/dashboard/territorio", label: "Territorio" },
                  { href: "/login", label: "Area Monitoraggio" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-slate-500 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:justify-between">
            <p className="text-[11px] text-slate-600">
              PAESC Nichelino 2030 &mdash; Piano d&apos;Azione per l&apos;Energia Sostenibile e il
              Clima
            </p>
            <Link
              href="https://azzeroco2.it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <img
                src="/logos/azzeroco2.svg"
                alt="AzzeroCO2"
                className="h-4 brightness-0 invert opacity-30 transition-opacity hover:opacity-60"
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
