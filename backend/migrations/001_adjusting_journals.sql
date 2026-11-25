-- ============================================================================
-- ARVEA BUMKam Mekar Sari - Skema Database Jurnal Penyesuaian (AJE)
-- Standar SAK EMKM | Mendukung Multi-Unit Usaha & Konsolidasi
-- ============================================================================

-- 1. Tabel Referensi Unit Usaha
CREATE TABLE IF NOT EXISTS business_units (
  code        VARCHAR(32) PRIMARY KEY, -- 'perdagangan' | 'jasa' | 'kantor'
  name        VARCHAR(120) NOT NULL,
  unit_type   VARCHAR(40)  NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO business_units (code, name, unit_type) VALUES
  ('perdagangan', 'Unit Perdagangan', 'Perdagangan'),
  ('jasa',        'Unit Jasa',        'Jasa'),
  ('kantor',      'Kantor Pengelola / Umum', 'Umum')
ON CONFLICT (code) DO NOTHING;

-- 2. Tabel Master Jurnal Penyesuaian (Header)
CREATE TABLE IF NOT EXISTS adjusting_journals (
  id             VARCHAR(40) PRIMARY KEY,
  reference_no   VARCHAR(40) NOT NULL UNIQUE,      -- Contoh: AJE-202611-001
  entry_date     DATE NOT NULL,                    -- Default akhir bulan periode
  unit_usaha     VARCHAR(32) NOT NULL,             -- FK -> business_units(code)
  category       VARCHAR(120),                     -- Kategori penyesuaian
  description    TEXT NOT NULL,
  total_debit    BIGINT NOT NULL DEFAULT 0,
  total_credit   BIGINT NOT NULL DEFAULT 0,
  status         VARCHAR(16) NOT NULL DEFAULT 'Draft'
                 CHECK (status IN ('Draft', 'Posted')),
  posted_at      TIMESTAMP NULL,
  created_by     VARCHAR(80),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aje_unit_usaha
    FOREIGN KEY (unit_usaha) REFERENCES business_units(code),
  CONSTRAINT chk_aje_balanced
    CHECK (total_debit > 0 AND total_debit = total_credit)
);

CREATE INDEX IF NOT EXISTS idx_aje_date ON adjusting_journals (entry_date);
CREATE INDEX IF NOT EXISTS idx_aje_unit ON adjusting_journals (unit_usaha);
CREATE INDEX IF NOT EXISTS idx_aje_status ON adjusting_journals (status);

-- 3. Tabel Detail Baris Jurnal Penyesuaian (Multi-row Debit / Kredit)
CREATE TABLE IF NOT EXISTS adjusting_journal_lines (
  id                   VARCHAR(40) PRIMARY KEY,
  adjusting_journal_id VARCHAR(40) NOT NULL,       -- FK -> adjusting_journals(id)
  unit_usaha           VARCHAR(32) NOT NULL,       -- FK -> business_units(code)
  line_no              INT NOT NULL DEFAULT 1,
  account_code         VARCHAR(20) NOT NULL,       -- Referensi COA (mis. 5105, 1591)
  account_name         VARCHAR(150) NOT NULL,
  debit                BIGINT NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit               BIGINT NOT NULL DEFAULT 0 CHECK (credit >= 0),
  line_memo            TEXT,
  CONSTRAINT fk_aje_line_master
    FOREIGN KEY (adjusting_journal_id) REFERENCES adjusting_journals(id) ON DELETE CASCADE,
  CONSTRAINT fk_aje_line_unit
    FOREIGN KEY (unit_usaha) REFERENCES business_units(code),
  CONSTRAINT chk_aje_line_side
    CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

CREATE INDEX IF NOT EXISTS idx_aje_lines_master ON adjusting_journal_lines (adjusting_journal_id);
CREATE INDEX IF NOT EXISTS idx_aje_lines_account ON adjusting_journal_lines (account_code);
CREATE INDEX IF NOT EXISTS idx_aje_lines_unit ON adjusting_journal_lines (unit_usaha);
