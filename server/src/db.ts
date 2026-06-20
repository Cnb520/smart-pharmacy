import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'pharmacy.db');

let SQL: SqlJsStatic | null = null;
let sqlDb: SqlJsDatabase | null = null;

function saveToDisk(): void {
  if (!sqlDb) return;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

interface StatementLike {
  run(...params: unknown[]): void;
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
}

class Statement implements StatementLike {
  private sql: string;
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  run(...params: unknown[]): void {
    this.db.run(this.sql, params);
    saveToDisk();
  }

  get(...params: unknown[]): Record<string, unknown> | undefined {
    const stmt = this.db.prepare(this.sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      stmt.free();
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < cols.length; i++) {
        obj[cols[i]] = vals[i];
      }
      return obj;
    }
    stmt.free();
    return undefined;
  }

  all(...params: unknown[]): Record<string, unknown>[] {
    const stmt = this.db.prepare(this.sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const cols = stmt.getColumnNames();
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      const vals = stmt.get();
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < cols.length; i++) {
        obj[cols[i]] = vals[i];
      }
      rows.push(obj);
    }
    stmt.free();
    return rows;
  }
}

interface DbWrapper {
  prepare(sql: string): Statement;
  exec(sql: string): void;
}

async function initDb(): Promise<DbWrapper> {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  let buffer: Uint8Array | undefined;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
  }
  sqlDb = new SQL.Database(buffer);

  const wrapper: DbWrapper = {
    prepare(sql: string): Statement {
      return new Statement(sqlDb!, sql);
    },
    exec(sql: string): void {
      sqlDb!.run(sql);
      saveToDisk();
    },
  };

  // 创建表结构
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE,
      nickname TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      wx_open_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drugs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL DEFAULT '',
      pinyin TEXT NOT NULL DEFAULT '',
      first_letter TEXT NOT NULL DEFAULT '',
      is_prescription INTEGER NOT NULL DEFAULT 0,
      category_id TEXT NOT NULL DEFAULT '',
      category_name TEXT NOT NULL DEFAULT '',
      routes TEXT NOT NULL DEFAULT '[]',
      specification TEXT NOT NULL DEFAULT '',
      dosage TEXT NOT NULL DEFAULT '',
      manufacturer TEXT NOT NULL DEFAULT '',
      approval_no TEXT NOT NULL DEFAULT '',
      barcode TEXT NOT NULL DEFAULT '',
      image_urls TEXT NOT NULL DEFAULT '[]',
      indication TEXT NOT NULL DEFAULT '',
      usage_text TEXT NOT NULL DEFAULT '',
      adverse_reactions TEXT NOT NULL DEFAULT '',
      contraindication TEXT NOT NULL DEFAULT '',
      precautions TEXT NOT NULL DEFAULT '',
      storage TEXT NOT NULL DEFAULT '',
      valid_period TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drug_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      type TEXT NOT NULL DEFAULT 'general',
      icon TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      source TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '',
      view_count INTEGER NOT NULL DEFAULT 0,
      comment_count INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      nickname TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favorite_folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      cover_image TEXT DEFAULT '',
      item_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favorite_items (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL,
      drug_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS browse_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_users_wx_open_id ON users(wx_open_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_drugs_first_letter ON drugs(first_letter)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_drugs_category_id ON drugs(category_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_drugs_is_prescription ON drugs(is_prescription)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_folders_user_id ON favorite_folders(user_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_items_folder_id ON favorite_items(folder_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_items_drug_id ON favorite_items(drug_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_browse_history_user_id ON browse_history(user_id)`);
  wrapper.exec(`CREATE INDEX IF NOT EXISTS idx_vc_phone ON verification_codes(phone)`);

  return wrapper;
}

// 单例模式
let dbInstance: DbWrapper | null = null;

export async function getDb(): Promise<DbWrapper> {
  if (!dbInstance) {
    dbInstance = await initDb();
  }
  return dbInstance;
}

export default getDb;
