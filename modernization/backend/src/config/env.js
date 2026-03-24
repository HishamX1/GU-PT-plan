const hasDbUrl = Boolean(process.env.DATABASE_URL);
const requestedMode = (process.env.DATA_MODE || '').toLowerCase();

let dataMode = 'postgres';
if (requestedMode === 'file') dataMode = 'file';
else if (requestedMode === 'postgres') dataMode = 'postgres';
else if (!hasDbUrl) dataMode = 'file';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  apiBasePath: process.env.API_BASE_PATH || '/api',
  allowCorsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  dataMode,
  pgSsl: ['1', 'true', 'yes'].includes(String(process.env.PG_SSL || '').toLowerCase())
};
