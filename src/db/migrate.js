const { query } = require('../config/db');

const migrations = [
  // ─── Migration 001: media_gallery table ───────────────────────
  {
    id: '001_create_media_gallery',
    sql: `
      CREATE TABLE IF NOT EXISTS media_gallery (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        title       TEXT        NOT NULL,
        gujarati_title TEXT,
        type        TEXT        NOT NULL CHECK (type IN ('youtube','image','file_image','file_video','instagram')),
        url         TEXT        NOT NULL,
        images      TEXT[]      DEFAULT '{}',
        description TEXT,
        category    TEXT        NOT NULL CHECK (category IN ('Image','Video')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_media_gallery_category ON media_gallery(category);
      CREATE INDEX IF NOT EXISTS idx_media_gallery_created_at ON media_gallery(created_at DESC);
    `,
  },

  // ─── Migration 002: services table ────────────────────────────
  {
    id: '002_create_services',
    sql: `
      CREATE TABLE IF NOT EXISTS services (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        icon        TEXT        NOT NULL,
        name        TEXT        NOT NULL,
        gujarati    TEXT,
        description TEXT,
        sort_order  INTEGER     NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);
    `,
  },

  // ─── Migration 003: bookings/inquiries table ───────────────────
  {
    id: '003_create_bookings',
    sql: `
      CREATE TABLE IF NOT EXISTS bookings (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name        TEXT        NOT NULL,
        phone       TEXT        NOT NULL,
        service     TEXT        NOT NULL,
        event_date  DATE,
        message     TEXT,
        status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','read','replied')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
    `,
  },

  // ─── Migration 004: schema_migrations tracker ─────────────────
  {
    id: '000_create_migrations_table',
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── Migration 005: updated_at trigger function ────────────────
  {
    id: '005_updated_at_trigger',
    sql: `
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_updated_at ON media_gallery;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON media_gallery
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

      DROP TRIGGER IF EXISTS set_updated_at ON services;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON services
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

      DROP TRIGGER IF EXISTS set_updated_at ON bookings;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON bookings
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    `,
  },
];

async function runMigrations() {
  console.log('⏳ Running database migrations...');

  // Create migrations table first (always safe)
  const bootstrapMigration = migrations.find((m) => m.id === '000_create_migrations_table');
  await query(bootstrapMigration.sql);

  for (const migration of migrations) {
    if (migration.id === '000_create_migrations_table') continue;

    const { rows } = await query('SELECT id FROM schema_migrations WHERE id = $1', [migration.id]);
    if (rows.length > 0) {
      console.log(`  ✓ [already applied] ${migration.id}`);
      continue;
    }

    try {
      await query(migration.sql);
      await query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
      console.log(`  ✅ [applied] ${migration.id}`);
    } catch (err) {
      console.error(`  ❌ [failed] ${migration.id}:`, err.message);
      throw err;
    }
  }

  console.log('✅ All migrations complete.\n');
}

module.exports = { runMigrations };
