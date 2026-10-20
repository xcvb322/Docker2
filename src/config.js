require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.APP_PORT || 3000,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'isur_orders',
    user: process.env.DB_USER || 'isur_app',
    password: process.env.DB_PASSWORD || 'secret',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
};
