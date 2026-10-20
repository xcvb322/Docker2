const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const config = require('../src/config');

async function run() {
  if (config.env === 'production') {
    console.error('Los scripts de seed no están permitidos en producción.');
    process.exit(1);
  }

  try {
    const seedPath = path.join(__dirname, '../db/seeds/001_demo_data.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    
    await db.query(sql);
    console.log('Datos de demostración (Seed).');
  } catch (err) {
    console.error('Error inyectando datos demo:', err.message);
    process.exit(1);
  } finally {
    await db.getPool().end();
  }
}

run();
