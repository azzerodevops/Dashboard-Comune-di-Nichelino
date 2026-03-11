-- ============================================================
-- PAESC Nichelino — Schema iniziale database di monitoraggio
-- ============================================================

-- 1. MACROTEMI (dati statici dal PAESC)
CREATE TABLE macrotemi (
  id TEXT PRIMARY KEY,
  numero INTEGER NOT NULL,
  label TEXT NOT NULL,
  colore TEXT NOT NULL,
  tco2_previste DECIMAL(10,2) NOT NULL,
  investimento_previsto DECIMAL(14,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AZIONI DI MITIGAZIONE (dati statici dal PAESC)
CREATE TABLE azioni_mitigazione (
  id TEXT PRIMARY KEY,
  macrotema_id TEXT NOT NULL REFERENCES macrotemi(id),
  titolo TEXT NOT NULL,
  descrizione TEXT,
  tco2_previste DECIMAL(10,2) NOT NULL,
  mwh_termici_previsti DECIMAL(12,2),
  mwh_elettrici_previsti DECIMAL(12,2),
  investimento_previsto DECIMAL(14,2),
  anno_avvio_previsto INTEGER,
  anno_fine_previsto INTEGER,
  note_paesc TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AGGIORNAMENTI MITIGAZIONE (cuore del monitoraggio)
CREATE TABLE aggiornamenti_mitigazione (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  azione_id TEXT NOT NULL REFERENCES azioni_mitigazione(id),
  data_aggiornamento DATE NOT NULL,

  -- Stato avanzamento
  stato TEXT NOT NULL CHECK (stato IN ('pianificato', 'in_corso', 'completato', 'sospeso')),
  percentuale_completamento INTEGER CHECK (percentuale_completamento BETWEEN 0 AND 100) DEFAULT 0,

  -- Dati reali misurati
  tco2_effettive DECIMAL(10,2),
  mwh_termici_effettivi DECIMAL(12,2),
  mwh_elettrici_effettivi DECIMAL(12,2),
  investimento_effettivo DECIMAL(14,2),

  -- Indicatori specifici per tipo azione
  kw_installati DECIMAL(10,2),
  mq_riqualificati DECIMAL(12,2),
  unita_trattate INTEGER,
  km_realizzati DECIMAL(8,2),
  punti_luce_sostituiti INTEGER,
  impianti_sostituiti INTEGER,
  mc_allacciati DECIMAL(12,2),
  mwh_prodotti DECIMAL(12,2),
  mwh_acquistati_verdi DECIMAL(12,2),
  classe_energetica_pre TEXT,
  classe_energetica_post TEXT,

  -- Metadati
  note TEXT,
  operatore TEXT,
  allegati JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agg_mit_azione_data ON aggiornamenti_mitigazione(azione_id, data_aggiornamento DESC);
CREATE INDEX idx_agg_mit_stato ON aggiornamenti_mitigazione(stato);

-- 4. AZIONI DI ADATTAMENTO (dati statici dal PAESC)
CREATE TABLE azioni_adattamento (
  id TEXT PRIMARY KEY,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  pericoli_climatici TEXT[] DEFAULT '{}',
  settori TEXT[] DEFAULT '{}',
  obiettivi TEXT[] DEFAULT '{}',
  periodo_inizio INTEGER,
  periodo_fine INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AGGIORNAMENTI ADATTAMENTO
CREATE TABLE aggiornamenti_adattamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  azione_id TEXT NOT NULL REFERENCES azioni_adattamento(id),
  data_aggiornamento DATE NOT NULL,

  -- Stato
  stato TEXT NOT NULL CHECK (stato IN ('pianificato', 'in_corso', 'completato', 'sospeso')),
  percentuale_completamento INTEGER CHECK (percentuale_completamento BETWEEN 0 AND 100) DEFAULT 0,

  -- Indicatori flessibili (diversi per ogni azione)
  indicatori JSONB NOT NULL DEFAULT '{}'::jsonb,

  investimento_effettivo DECIMAL(14,2),
  note TEXT,
  operatore TEXT,
  allegati JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agg_ada_azione_data ON aggiornamenti_adattamento(azione_id, data_aggiornamento DESC);

-- 6. RISCHI CLIMATICI (dati statici)
CREATE TABLE rischi_climatici (
  id TEXT PRIMARY KEY,
  pericolo TEXT NOT NULL,
  probabilita TEXT NOT NULL,
  livello TEXT NOT NULL,
  tendenza TEXT NOT NULL,
  note TEXT
);

-- 7. KPI SNAPSHOT (istantanee periodiche)
CREATE TABLE kpi_snapshot (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_snapshot DATE NOT NULL,

  tco2_ridotte_totali DECIMAL(12,2),
  tco2_target_2030 DECIMAL(12,2) DEFAULT 139192,
  tco2_ibe_2000 DECIMAL(12,2) DEFAULT 231986,
  pct_riduzione_effettiva DECIMAL(5,2),

  azioni_mit_totali INTEGER,
  azioni_mit_completate INTEGER,
  azioni_mit_in_corso INTEGER,
  azioni_ada_totali INTEGER,
  azioni_ada_completate INTEGER,
  azioni_ada_in_corso INTEGER,

  investimento_totale_attivato DECIMAL(14,2),
  investimento_totale_previsto DECIMAL(14,2),

  note TEXT,
  operatore TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PROFILI UTENTI (collegati a auth.users)
CREATE TABLE profili_utenti (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('admin', 'operatore', 'lettore')) DEFAULT 'lettore',
  servizio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Abilita RLS su tutte le tabelle con dati di monitoraggio
ALTER TABLE aggiornamenti_mitigazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggiornamenti_adattamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE profili_utenti ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica per i dati di monitoraggio
CREATE POLICY "Lettura pubblica aggiornamenti mitigazione"
  ON aggiornamenti_mitigazione FOR SELECT USING (true);

CREATE POLICY "Lettura pubblica aggiornamenti adattamento"
  ON aggiornamenti_adattamento FOR SELECT USING (true);

CREATE POLICY "Lettura pubblica kpi snapshot"
  ON kpi_snapshot FOR SELECT USING (true);

-- Scrittura solo per operatori e admin
CREATE POLICY "Inserimento operatori mitigazione"
  ON aggiornamenti_mitigazione FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profili_utenti
    WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  ));

CREATE POLICY "Modifica operatori mitigazione"
  ON aggiornamenti_mitigazione FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profili_utenti
    WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  ));

CREATE POLICY "Inserimento operatori adattamento"
  ON aggiornamenti_adattamento FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profili_utenti
    WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  ));

CREATE POLICY "Modifica operatori adattamento"
  ON aggiornamenti_adattamento FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profili_utenti
    WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  ));

CREATE POLICY "Inserimento kpi snapshot"
  ON kpi_snapshot FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profili_utenti
    WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  ));

-- Profili: ognuno vede il proprio, admin vede tutti
CREATE POLICY "Utenti vedono proprio profilo"
  ON profili_utenti FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profili_utenti p WHERE p.id = auth.uid() AND p.ruolo = 'admin'
  ));

CREATE POLICY "Admin gestisce profili"
  ON profili_utenti FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profili_utenti p WHERE p.id = auth.uid() AND p.ruolo = 'admin'
  ));

-- Tabelle statiche: lettura pubblica, nessuna scrittura diretta
ALTER TABLE macrotemi ENABLE ROW LEVEL SECURITY;
ALTER TABLE azioni_mitigazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE azioni_adattamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE rischi_climatici ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lettura pubblica macrotemi" ON macrotemi FOR SELECT USING (true);
CREATE POLICY "Lettura pubblica azioni mitigazione" ON azioni_mitigazione FOR SELECT USING (true);
CREATE POLICY "Lettura pubblica azioni adattamento" ON azioni_adattamento FOR SELECT USING (true);
CREATE POLICY "Lettura pubblica rischi climatici" ON rischi_climatici FOR SELECT USING (true);

-- Admin può gestire dati statici
CREATE POLICY "Admin gestisce macrotemi" ON macrotemi FOR ALL
  USING (EXISTS (SELECT 1 FROM profili_utenti WHERE id = auth.uid() AND ruolo = 'admin'));
CREATE POLICY "Admin gestisce azioni mitigazione" ON azioni_mitigazione FOR ALL
  USING (EXISTS (SELECT 1 FROM profili_utenti WHERE id = auth.uid() AND ruolo = 'admin'));
CREATE POLICY "Admin gestisce azioni adattamento" ON azioni_adattamento FOR ALL
  USING (EXISTS (SELECT 1 FROM profili_utenti WHERE id = auth.uid() AND ruolo = 'admin'));
CREATE POLICY "Admin gestisce rischi climatici" ON rischi_climatici FOR ALL
  USING (EXISTS (SELECT 1 FROM profili_utenti WHERE id = auth.uid() AND ruolo = 'admin'));

-- ============================================================
-- TRIGGER: updated_at automatico
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agg_mit_updated
  BEFORE UPDATE ON aggiornamenti_mitigazione
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agg_ada_updated
  BEFORE UPDATE ON aggiornamenti_adattamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
