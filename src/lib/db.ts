import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Singleton for db connection in dev to avoid multiple instances due to HMR
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

const dbPath = path.join(process.cwd(), 'job-tracker.db');

export async function getDb(): Promise<Database> {
    if (db) return db;

    if (!initPromise) {
        initPromise = (async () => {
            const dbInstance = await open({
                filename: dbPath,
                driver: sqlite3.Database,
            });

            // Initialize schema
            await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          company_name TEXT,
          job_title TEXT,
          description TEXT,
          responsibilities TEXT, -- Store JSON array of strings
          requirements TEXT, -- Store JSON array of strings
          skills TEXT, -- Store JSON array of { name: string, type: 'Hard' | 'Soft' | 'Technology' }
          category TEXT,
          status TEXT DEFAULT 'Applied',
          applied_date TEXT NOT NULL -- Store as ISO string
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

            // Initialize default daily goal if not set
            await dbInstance.run(
                `INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_goal', '10')`
            );

            return dbInstance;
        })();
    }

    db = await initPromise;
    return db;
}
