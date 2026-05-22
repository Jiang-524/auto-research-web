// Paper Library SQLite database module
// Manages local paper metadata, chunks, summaries, notes, and research tasks.

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { safeResolve } = require("./path-safety");

let db = null;

function getDbPath() {
  return process.env.AUTO_RESEARCH_DB_PATH || path.join(__dirname, "..", ".auto-research", "research.db");
}

function initDb() {
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      title TEXT,
      authors TEXT,
      year INTEGER,
      venue TEXT,
      abstract TEXT,
      doi TEXT,
      arxiv_id TEXT,
      url TEXT,
      local_path TEXT,
      source TEXT,
      tags TEXT,
      status TEXT DEFAULT 'imported',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS paper_files (
      id TEXT PRIMARY KEY,
      paper_id TEXT,
      file_path TEXT,
      file_type TEXT,
      file_hash TEXT,
      size_bytes INTEGER,
      imported_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (paper_id) REFERENCES papers(id)
    );

    CREATE TABLE IF NOT EXISTS paper_chunks (
      id TEXT PRIMARY KEY,
      paper_id TEXT,
      chunk_index INTEGER,
      section_title TEXT,
      text TEXT,
      token_count INTEGER,
      embedding_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (paper_id) REFERENCES papers(id)
    );

    CREATE TABLE IF NOT EXISTS paper_summaries (
      id TEXT PRIMARY KEY,
      paper_id TEXT,
      summary_type TEXT,
      content TEXT,
      model TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (paper_id) REFERENCES papers(id)
    );

    CREATE TABLE IF NOT EXISTS paper_notes (
      id TEXT PRIMARY KEY,
      paper_id TEXT,
      note_type TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (paper_id) REFERENCES papers(id)
    );

    CREATE TABLE IF NOT EXISTS research_tasks (
      id TEXT PRIMARY KEY,
      task_type TEXT,
      topic TEXT,
      selected_paper_ids TEXT,
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      result_path TEXT,
      logs TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

function getDb() {
  if (!db) initDb();
  return db;
}

function dbHealth() {
  const database = getDb();
  const paperCount = database.prepare("SELECT COUNT(*) as count FROM papers").get().count;
  const chunkCount = database.prepare("SELECT COUNT(*) as count FROM paper_chunks").get().count;
  const taskCount = database.prepare("SELECT COUNT(*) as count FROM research_tasks").get().count;
  return {
    ok: true,
    dbPath: getDbPath(),
    paperCount,
    chunkCount,
    taskCount,
    lastScanTime: null
  };
}

function listPapers({ limit = 50, offset = 0, status, topic, year } = {}) {
  const database = getDb();
  let sql = "SELECT * FROM papers WHERE 1=1";
  const params = {};
  if (status && status !== "all") { sql += " AND status = @status"; params.status = status; }
  if (year && year !== "all") { sql += " AND year = @year"; params.year = parseInt(year); }
  sql += " ORDER BY year DESC, created_at DESC LIMIT @limit OFFSET @offset";
  params.limit = limit;
  params.offset = offset;
  return database.prepare(sql).all(params);
}

function getPaper(id) {
  const database = getDb();
  return database.prepare("SELECT * FROM papers WHERE id = ?").get(id);
}

function searchPapers({ query, tags, year, venue, status } = {}) {
  const database = getDb();
  let sql = "SELECT * FROM papers WHERE 1=1";
  const params = {};
  if (query) {
    sql += " AND (title LIKE @query OR authors LIKE @query OR abstract LIKE @query OR venue LIKE @query)";
    params.query = `%${query}%`;
  }
  if (tags) { sql += " AND tags LIKE @tags"; params.tags = `%${tags}%`; }
  if (year && year !== "all") { sql += " AND year = @year"; params.year = parseInt(year); }
  if (venue && venue !== "all") { sql += " AND venue LIKE @venue"; params.venue = `%${venue}%`; }
  if (status && status !== "all") { sql += " AND status = @status"; params.status = status; }
  sql += " ORDER BY year DESC LIMIT 100";
  return database.prepare(sql).all(params);
}

function scanPaperFolder() {
  const paperDir = process.env.AUTO_RESEARCH_PAPER_DIR || "E:/paper";
  if (!fs.existsSync(paperDir)) {
    return { found: 0, newFiles: 0, error: `Paper directory not found: ${paperDir}` };
  }

  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); }
      else if (/\.(pdf|txt|md|bib)$/i.test(entry.name)) {
        files.push({ name: entry.name, path: full, type: path.extname(entry.name).toLowerCase() });
      }
    }
  }
  walk(paperDir);

  // Check which are already in DB
  const database = getDb();
  const existing = new Set(
    database.prepare("SELECT local_path FROM papers").all().map((r) => r.local_path)
  );
  const newFiles = files.filter((f) => !existing.has(f.path));

  return {
    found: files.length,
    existingCount: files.length - newFiles.length,
    newCount: newFiles.length,
    newFiles: newFiles.slice(0, 100).map((f) => ({ name: f.name, path: f.path, type: f.type })),
    paperDir
  };
}

function importPaper(paperData) {
  const database = getDb();
  const id = paperData.id || `paper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO papers (id, title, authors, year, venue, abstract, doi, arxiv_id, url, local_path, source, tags, status)
    VALUES (@id, @title, @authors, @year, @venue, @abstract, @doi, @arxiv_id, @url, @local_path, @source, @tags, @status)
  `);
  stmt.run({ ...paperData, id });
  return { id, imported: true };
}

function addNote(paperId, noteType, content) {
  const database = getDb();
  const id = `note_${Date.now()}`;
  database.prepare(`
    INSERT INTO paper_notes (id, paper_id, note_type, content) VALUES (?, ?, ?, ?)
  `).run(id, paperId, noteType, content);
  return { id, paperId, noteType };
}

function getNotes(paperId) {
  const database = getDb();
  return database.prepare("SELECT * FROM paper_notes WHERE paper_id = ? ORDER BY created_at DESC").all(paperId);
}

module.exports = {
  initDb, getDb, dbHealth,
  listPapers, getPaper, searchPapers,
  scanPaperFolder, importPaper,
  addNote, getNotes,
  getDbPath
};
