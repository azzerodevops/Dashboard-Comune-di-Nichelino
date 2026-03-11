import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAESC } from "@/lib/constants";

// ---------------------------------------------------------------------------
// GET  — public read of all snapshots (newest first)
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("kpi_snapshot")
      .select("*")
      .order("data_snapshot", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[kpi-snapshot GET]", err);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST — calculate + save a new KPI snapshot  (admin / operatore only)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // ---- Auth check -------------------------------------------------------
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    const { data: profilo, error: profiloError } = await admin
      .from("profili_utenti")
      .select("ruolo")
      .eq("id", user.id)
      .single();

    if (profiloError || !profilo) {
      return NextResponse.json(
        { error: "Profilo utente non trovato" },
        { status: 403 },
      );
    }

    if (profilo.ruolo !== "admin" && profilo.ruolo !== "operatore") {
      return NextResponse.json(
        { error: "Permessi insufficienti" },
        { status: 403 },
      );
    }

    // ---- Aggregate mitigazione data --------------------------------------
    // Get latest aggiornamento per each azione_mitigazione
    const { data: latestMit, error: mitError } = await admin.rpc(
      "get_latest_aggiornamenti_mitigazione",
    );

    let tco2RidotteTotali = 0;
    let azioniMitCompletate = 0;
    let azioniMitInCorso = 0;
    let investimentoEffettivo = 0;

    if (mitError) {
      // Fallback: manual aggregation if RPC does not exist
      const { data: aggiornamenti, error: aggError } = await admin
        .from("aggiornamenti_mitigazione")
        .select("azione_id, data_aggiornamento, stato, tco2_effettive, investimento_effettivo")
        .order("data_aggiornamento", { ascending: false });

      if (aggError) {
        return NextResponse.json(
          { error: "Errore nel recupero aggiornamenti mitigazione: " + aggError.message },
          { status: 500 },
        );
      }

      // Keep only the latest aggiornamento per azione
      const latestByAzione = new Map<
        string,
        {
          stato: string;
          tco2_effettive: number | null;
          investimento_effettivo: number | null;
        }
      >();

      for (const agg of aggiornamenti ?? []) {
        if (!latestByAzione.has(agg.azione_id)) {
          latestByAzione.set(agg.azione_id, {
            stato: agg.stato,
            tco2_effettive: agg.tco2_effettive,
            investimento_effettivo: agg.investimento_effettivo,
          });
        }
      }

      for (const val of latestByAzione.values()) {
        tco2RidotteTotali += val.tco2_effettive ?? 0;
        investimentoEffettivo += val.investimento_effettivo ?? 0;
        if (val.stato === "completato") azioniMitCompletate++;
        if (val.stato === "in_corso") azioniMitInCorso++;
      }
    } else {
      // RPC succeeded
      for (const row of latestMit ?? []) {
        tco2RidotteTotali += row.tco2_effettive ?? 0;
        investimentoEffettivo += row.investimento_effettivo ?? 0;
        if (row.stato === "completato") azioniMitCompletate++;
        if (row.stato === "in_corso") azioniMitInCorso++;
      }
    }

    // Total mitigazione actions count
    const { count: azioniMitTotali } = await admin
      .from("azioni_mitigazione")
      .select("id", { count: "exact", head: true });

    // ---- Aggregate adattamento data --------------------------------------
    const { data: aggAdattamento, error: adaError } = await admin
      .from("aggiornamenti_adattamento")
      .select("azione_id, data_aggiornamento, stato, investimento_effettivo")
      .order("data_aggiornamento", { ascending: false });

    if (adaError) {
      return NextResponse.json(
        { error: "Errore nel recupero aggiornamenti adattamento: " + adaError.message },
        { status: 500 },
      );
    }

    const latestAdaByAzione = new Map<
      string,
      { stato: string; investimento_effettivo: number | null }
    >();

    for (const agg of aggAdattamento ?? []) {
      if (!latestAdaByAzione.has(agg.azione_id)) {
        latestAdaByAzione.set(agg.azione_id, {
          stato: agg.stato,
          investimento_effettivo: agg.investimento_effettivo,
        });
      }
    }

    let azioniAdaCompletate = 0;
    let azioniAdaInCorso = 0;

    for (const val of latestAdaByAzione.values()) {
      investimentoEffettivo += val.investimento_effettivo ?? 0;
      if (val.stato === "completato") azioniAdaCompletate++;
      if (val.stato === "in_corso") azioniAdaInCorso++;
    }

    const { count: azioniAdaTotali } = await admin
      .from("azioni_adattamento")
      .select("id", { count: "exact", head: true });

    // ---- Investimento totale previsto (from macrotemi) --------------------
    const { data: macrotemi, error: macroError } = await admin
      .from("macrotemi")
      .select("investimento_previsto");

    if (macroError) {
      return NextResponse.json(
        { error: "Errore nel recupero macrotemi: " + macroError.message },
        { status: 500 },
      );
    }

    const investimentoPrevisto = (macrotemi ?? []).reduce(
      (sum, m) => sum + (m.investimento_previsto ?? 0),
      0,
    );

    // ---- Calculate % riduzione -------------------------------------------
    const riduzioneNecessaria = PAESC.tco2_ibe_2000 - PAESC.tco2_target_2030;
    const pctRiduzione =
      riduzioneNecessaria > 0
        ? (tco2RidotteTotali / riduzioneNecessaria) * 100
        : null;

    // ---- Insert snapshot --------------------------------------------------
    const snapshot = {
      data_snapshot: new Date().toISOString(),
      tco2_ridotte_totali: tco2RidotteTotali,
      tco2_target_2030: PAESC.tco2_target_2030,
      tco2_ibe_2000: PAESC.tco2_ibe_2000,
      pct_riduzione_effettiva: pctRiduzione !== null ? Math.round(pctRiduzione * 100) / 100 : null,
      azioni_mit_totali: azioniMitTotali ?? 0,
      azioni_mit_completate: azioniMitCompletate,
      azioni_mit_in_corso: azioniMitInCorso,
      azioni_ada_totali: azioniAdaTotali ?? 0,
      azioni_ada_completate: azioniAdaCompletate,
      azioni_ada_in_corso: azioniAdaInCorso,
      investimento_totale_attivato: investimentoEffettivo,
      investimento_totale_previsto: investimentoPrevisto,
    };

    const { data: created, error: insertError } = await admin
      .from("kpi_snapshot")
      .insert(snapshot)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Errore nel salvataggio snapshot: " + insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[kpi-snapshot POST]", err);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
