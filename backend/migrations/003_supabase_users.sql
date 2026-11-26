-- ============================================================================
-- ARVÉA BUMKam Mekar Sari — Skema & Policy Supabase Tabel `public.users`
-- Jalankan script ini sekali di Supabase Dashboard -> SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id                   VARCHAR(60)  PRIMARY KEY,
  full_name            VARCHAR(150) NOT NULL,
  username             VARCHAR(80)  NOT NULL UNIQUE,
  email                VARCHAR(150) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(60)  NOT NULL DEFAULT 'Umum'
                       CHECK (role IN (
                         'Administrator',
                         'Ketua BUMKam',
                         'Sekretaris BUMKam',
                         'Bendahara BUMKam',
                         'Auditor',
                         'Umum'
                       )),
  unit_kerja           VARCHAR(100) NOT NULL DEFAULT 'BUMKam Mekar Sari',
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,
  password_changed_at  TIMESTAMPTZ  NULL,
  is_default_account   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deactivated_at       TIMESTAMPTZ  NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username  ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_email     ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_role      ON public.users (role);

-- Aktifkan Row Level Security (RLS) dengan policy akses untuk aplikasi ARVÉA (anon & authenticated)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "arvea_users_select" ON public.users;
DROP POLICY IF EXISTS "arvea_users_insert" ON public.users;
DROP POLICY IF EXISTS "arvea_users_update" ON public.users;

CREATE POLICY "arvea_users_select"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "arvea_users_insert"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "arvea_users_update"
  ON public.users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO anon, authenticated;

-- Catatan:
-- Setelah tabel ini dibuat, login pertama kali di website ARVÉA akan otomatis
-- mengisi 6 akun awal resmi (Administrator, Ketua BUMKam, Sekretaris BUMKam,
-- Bendahara BUMKam, Auditor, Umum) dengan password terenkripsi (password_hash).
