import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { ensureDataStore, query, closePool } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationFile = path.resolve(__dirname, '../../../db/migrations/001_init.sql');

if (env.dataMode === 'file') {
  await ensureDataStore();
  console.log('File-based store initialized (no-op migration in file mode).');
} else {
  const sql = fs.readFileSync(migrationFile, 'utf8');
  await query(sql);
  await closePool();
  console.log('PostgreSQL migrations applied.');
}
