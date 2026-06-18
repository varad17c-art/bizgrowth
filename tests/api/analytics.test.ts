import request from 'supertest';
import express from 'express';
import analyticsRouter from '../../src/server/routes/analytics';

const app = express();
app.use('/api/analytics', analyticsRouter);

test('GET /api/analytics returns ok and data', async () => {
  const res = await request(app).get('/api/analytics');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.data).toBeDefined();
});
