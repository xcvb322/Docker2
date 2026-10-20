const express = require('express');
const db = require('./db');
const config = require('./config');

const app = express();
app.use(express.json());


app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/health/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'READY', database: 'CONNECTED' });
  } catch (err) {
    res.status(503).json({ status: 'DOWN', reason: 'Database unavailable' });
  }
});

app.get('/version', (req, res) => {
  res.status(200).json({ version: '1.0.0', env: config.env });
});


app.get('/api/v1/customers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/customers', async (req, res) => {
  const { document_number, full_name, email } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO customers (document_number, full_name, email) VALUES ($1, $2, $3) RETURNING *',
      [document_number, full_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Código de error PostgreSQL para Unique Violation
      return res.status(409).json({ error: 'Document number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/v1/orders', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
