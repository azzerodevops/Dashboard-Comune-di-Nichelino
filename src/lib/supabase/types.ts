export type Macrotema = {
  id: string;
  numero: number;
  label: string;
  colore: string;
  tco2_previste: number;
  investimento_previsto: number | null;
};

export type AzioneMitigazione = {
  id: string;
  macrotema_id: string;
  titolo: string;
  descrizione: string | null;
  tco2_previste: number;
  mwh_termici_previsti: number | null;
  mwh_elettrici_previsti: number | null;
  investimento_previsto: number | null;
  anno_avvio_previsto: number | null;
  anno_fine_previsto: number | null;
  note_paesc: string | null;
};

export type AggiornamentoMitigazione = {
  id: string;
  azione_id: string;
  data_aggiornamento: string;
  stato: "pianificato" | "in_corso" | "completato" | "sospeso";
  percentuale_completamento: number;
  tco2_effettive: number | null;
  mwh_termici_effettivi: number | null;
  mwh_elettrici_effettivi: number | null;
  investimento_effettivo: number | null;
  kw_installati: number | null;
  mq_riqualificati: number | null;
  unita_trattate: number | null;
  km_realizzati: number | null;
  punti_luce_sostituiti: number | null;
  impianti_sostituiti: number | null;
  mc_allacciati: number | null;
  mwh_prodotti: number | null;
  mwh_acquistati_verdi: number | null;
  classe_energetica_pre: string | null;
  classe_energetica_post: string | null;
  note: string | null;
  operatore: string | null;
  allegati: Record<string, unknown>[];
};

export type AzioneAdattamento = {
  id: string;
  titolo: string;
  descrizione: string | null;
  pericoli_climatici: string[];
  settori: string[];
  obiettivi: string[];
  periodo_inizio: number | null;
  periodo_fine: number | null;
};

export type AggiornamentoAdattamento = {
  id: string;
  azione_id: string;
  data_aggiornamento: string;
  stato: "pianificato" | "in_corso" | "completato" | "sospeso";
  percentuale_completamento: number;
  indicatori: Record<string, string | number | boolean>;
  investimento_effettivo: number | null;
  note: string | null;
  operatore: string | null;
  allegati: Record<string, unknown>[];
};

export type RischioClimatico = {
  id: string;
  pericolo: string;
  probabilita: string;
  livello: string;
  tendenza: string;
  note: string | null;
};

export type KpiSnapshot = {
  id: string;
  data_snapshot: string;
  tco2_ridotte_totali: number | null;
  tco2_target_2030: number;
  tco2_ibe_2000: number;
  pct_riduzione_effettiva: number | null;
  azioni_mit_totali: number | null;
  azioni_mit_completate: number | null;
  azioni_mit_in_corso: number | null;
  azioni_ada_totali: number | null;
  azioni_ada_completate: number | null;
  azioni_ada_in_corso: number | null;
  investimento_totale_attivato: number | null;
  investimento_totale_previsto: number | null;
};

export type ProfiloUtente = {
  id: string;
  nome: string;
  cognome: string;
  ruolo: "admin" | "operatore" | "lettore";
  servizio: string | null;
};
