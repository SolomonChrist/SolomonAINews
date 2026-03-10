/**
 * Stub database module for compatibility
 * The system uses JSON file storage instead of a database
 */

interface Database {
  run: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  get: (sql: string, params?: any[]) => Promise<any>;
}

class StubDatabase implements Database {
  async run(sql: string, params?: any[]) {
    return { id: 1 };
  }

  async all(sql: string, params?: any[]) {
    return [];
  }

  async get(sql: string, params?: any[]) {
    return null;
  }
}

let db: Database | null = null;

export async function initializeDatabase(): Promise<void> {
  db = new StubDatabase();
  console.log('Database (stub) initialized');
}

export function getDatabase(): Database {
  if (!db) {
    db = new StubDatabase();
  }
  return db;
}
