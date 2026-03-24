import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../../../data/runtime-db.json');

const base = {
  colleges: [],
  programs: [],
  years: [],
  semesters: [],
  subjects: [],
  subjectPrerequisites: [],
  counters: { colleges: 1, programs: 1, years: 1, semesters: 1, subjects: 1 }
};

let pool;

async function getPool() {
  if (env.dataMode !== 'postgres') return null;
  if (pool) return pool;

  let PoolCtor;
  try {
    ({ Pool: PoolCtor } = await import('pg'));
  } catch {
    throw new Error('PG_DRIVER_MISSING');
  }

  pool = new PoolCtor({
    connectionString: env.databaseUrl,
    ssl: env.pgSsl ? { rejectUnauthorized: false } : undefined
  });
  return pool;
}

function atomicWriteJson(filePath, obj) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(obj, null, 2)}\n`);
  fs.renameSync(tmpPath, filePath);
}

function freshStore() {
  return structuredClone(base);
}

function loadStore() {
  if (!fs.existsSync(dataPath)) return freshStore();
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveStore(store) {
  atomicWriteJson(dataPath, store);
}

function ensureFileStore() {
  if (!fs.existsSync(dataPath)) {
    saveStore(freshStore());
  }
}

function nextId(store, key) {
  const id = store.counters[key];
  store.counters[key] += 1;
  return id;
}

export async function ensureDataStore() {
  if (env.dataMode === 'file') {
    ensureFileStore();
    return;
  }
  const activePool = await getPool();
  await activePool.query('SELECT 1');
}

export async function query(sql, params = []) {
  const activePool = await getPool();
  if (!activePool) throw new Error('DB_NOT_CONFIGURED');
  return activePool.query(sql, params);
}

export function withFileStore(work) {
  const store = loadStore();
  const result = work(store, nextId);
  saveStore(store);
  return result;
}

export function readFileStore(work) {
  const store = loadStore();
  return work(store);
}

export async function closePool() {
  if (pool) await pool.end();
}
