import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CalEvent, CalEventInput } from './types';

const DB_PATH = process.env.CAL_DB_PATH ?? path.join(process.cwd(), 'data', 'cal.db');

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  ensureDir();
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      day TEXT NOT NULL CHECK (day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
      time_start TEXT,
      time_end TEXT,
      category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('wfo','wfh','gym','renang','lari','client','belajar','ibadah','personal','other')),
      note TEXT,
      repeat TEXT NOT NULL DEFAULT 'none' CHECK (repeat IN ('none','weekly')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_day ON events(day);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
  `);

  // Migration: add date column if not exists (idempotent)
  try {
    db.exec(`ALTER TABLE events ADD COLUMN date TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }

  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);
  } catch {
    // Index already exists
  }

  dbInstance = db;
  return db;
}

export function insertEvent(input: CalEventInput): CalEvent {
  const db = getDb();
  return db.prepare(`
    INSERT INTO events (title, day, time_start, time_end, category, note, repeat, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    input.title,
    input.day,
    input.time_start ?? null,
    input.time_end ?? null,
    input.category ?? 'other',
    input.note ?? null,
    input.repeat ?? 'none',
    input.date ?? null,
  ) as CalEvent;
}

export function listEvents(): CalEvent[] {
  return getDb().prepare('SELECT * FROM events ORDER BY date, day, time_start').all() as CalEvent[];
}

export function deleteEvent(id: number): boolean {
  return getDb().prepare('DELETE FROM events WHERE id = ?').run(id).changes > 0;
}

export function updateEvent(id: number, input: Partial<CalEventInput>): CalEvent | null {
  const db = getDb();
  const fields = Object.entries(input)
    .filter(([, v]) => v !== undefined)
    .map(([k]) => `${k} = ?`);
  if (!fields.length) return null;
  const vals = Object.entries(input).filter(([, v]) => v !== undefined).map(([, v]) => v);
  return db.prepare(`UPDATE events SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ? RETURNING *`)
    .get(...vals, id) as CalEvent | null;
}
