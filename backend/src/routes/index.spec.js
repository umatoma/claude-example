import request from 'supertest';
import app from '../app.js';

describe('GET /', () => {
  it('ステータス200を返す', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('レスポンスに <h1>Claude Example</h1> が含まれる', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('<h1>Claude Example</h1>');
  });

  it('Content-Type が text/html を含む', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toContain('text/html');
  });
});
