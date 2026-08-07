import axios from 'axios';

describe('AppModule (e2e)', () => {
  it('GET /api should return 200', async () => {
    const res = await axios.get('/api');

    expect(res.status).toBe(200);
  });
});
