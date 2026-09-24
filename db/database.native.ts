import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('gym_paglu.db');
  }
  return db;
};

export const initDB = async (): Promise<void> => {
  const database = getDB();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'membership',
      duration_days INTEGER NOT NULL,
      price REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_number TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      photo_uri TEXT,
      plan_id TEXT,
      joining_date TEXT NOT NULL,
      next_due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      sync_status TEXT NOT NULL DEFAULT 'pending',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_at TEXT,
      due_date TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'due',
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      check_in_at TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'manual',
      sync_status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS gym_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
};
