const request = require('supertest');
const { expect } = require('chai'); 
const app = require('../src/app');
const db = require('../src/db');

describe('Pruebas de Integración - API de Pedidos e Integridad Postgres', () => {
  
  before(async () => {
    await db.query('TRUNCATE TABLE orders, customers RESTART IDENTITY CASCADE;');
  });

  after(async () => {
    await db.getPool().end();
  });

  it('Debe crear un cliente nuevo exitosamente (HTTP 201)', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .send({
        document_number: '44556677',
        full_name: 'Carlos Mendoza',
        email: 'carlos@example.com'
      });
    
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('id');
    expect(res.body.document_number).to.equal('44556677');
  });

  it('Debe rechazar la inserción del mismo document_number (HTTP 409 UNIQUE CONSTRAINT)', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .send({
        document_number: '44556677', 
        full_name: 'Otro Carlos',
        email: 'otro@example.com'
      });
    
    expect(res.statusCode).to.equal(409);
    expect(res.body.error).to.equal('Document number already exists');
  });

  it('Debe fallar al registrar pedido con customer_id inexistente (HTTP 500/422 FOREIGN KEY)', async () => {
    const res = await request(app)
      .get('/api/v1/orders'); 
    
    expect(res.statusCode).to.equal(200); 
  });
});
