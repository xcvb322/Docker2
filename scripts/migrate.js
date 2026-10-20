const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../src/db');

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function run() {
  const client = await db.getPool().connect();
  try {
    await client.query('SELECT pg_advisory_lock(156489461);');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, '../db/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const currentChecksum = calculateChecksum(content);

      const dbCheck = await client.query('SELECT checksum FROM schema_migrations WHERE version = \$1', [file]);

      if (dbCheck.rows.length > 0) {

        if (dbCheck.rows[0].checksum !== currentChecksum) {
          console.error(`ERROR DE CHECKSUM: El archivo de migración aplicado '${file}' ha sido modificado de forma histórica.`);
          process.exit(1);
        }
      } else {
      
        console.log(`Aplicando migración pendiente: ${file}`);
        await client.query('BEGIN');
        await client.query(content);
        await client.query('INSERT INTO schema_migrations (version, checksum) VALUES (\$1, \$2)', [file, currentChecksum]);
        await client.query('COMMIT');
      }
    }

    console.log('Base de datos completamente actualizada.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fatal en el proceso de migración:', error.message);
    process.exit(1);
  } finally {
    await client.query('SELECT pg_advisory_unlock(156489461);');
    client.release();
    await db.getPool().end();
  }
}

run();
