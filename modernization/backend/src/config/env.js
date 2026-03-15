export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  apiBasePath: process.env.API_BASE_PATH || '/api',
  allowCorsOrigin: process.env.CORS_ORIGIN || '*'
};
