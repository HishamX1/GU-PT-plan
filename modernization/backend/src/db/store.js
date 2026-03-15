import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function atomicWriteJson(filePath, obj) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(obj, null, 2)}\n`);
  fs.renameSync(tmpPath, filePath);
}

export function freshStore() {
  return structuredClone(base);
}

export function loadStore() {
  if (!fs.existsSync(dataPath)) return freshStore();
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

export function saveStore(store) {
  atomicWriteJson(dataPath, store);
}

export function ensureStore() {
  if (!fs.existsSync(dataPath)) {
    saveStore(freshStore());
  }
}

export function nextId(store, key) {
  const id = store.counters[key];
  store.counters[key] += 1;
  return id;
}
