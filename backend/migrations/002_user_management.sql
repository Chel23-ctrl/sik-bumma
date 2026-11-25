-- ============================================================================
-- ARVEA BUMKam Mekar Sari - Penyesuaian Skema Database Tabel Users
-- Fitur: Pengelolaan Pengguna (User Management), Soft Disable & First-Time Login
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                   VARCHAR(40)  PRIMARY KEY,
  full_name            VARCHAR(150) NOT NULL,
  username             VARCHAR(80)  NOT NULL UNIQUE,
  email                VARCHAR(150) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(60)  NOT NULL DEFAULT 'Umum',
  unit_kerja           VARCHAR(100) NOT NULL DEFAULT 'BUMKam Mekar Sari',
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,   -- Soft delete / nonaktifkan akun
  must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,   -- Wajib ganti password saat login perdana
  password_changed_at  TIMESTAMP    NULL,                    -- NULL menandakan belum pernah ganti password
  is_default_account   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deactivated_at       TIMESTAMP    NULL
);

-- Jika tabel users sudah ada sebelumnya, jalankan ALTER TABLE berikut:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(80) UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(60) NOT NULL DEFAULT 'Umum';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS unit_kerja VARCHAR(100) NOT NULL DEFAULT 'BUMKam Mekar Sari';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_users_username  ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_role      ON users (role);
