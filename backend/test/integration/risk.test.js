const request = require('supertest');
// const app = require('../../src/app'); // To be imported once Rahil implements the app entrypoint

describe('Risk API Contract Tests', () => {
  describe.skip('POST /api/risk/analyze', () => {
    it('should return 400 for malformed project ID', async () => {
      // const response = await request(app).post('/api/risk/analyze').send({}).set('Authorization', 'Bearer MOCK_TOKEN');
      // expect(response.status).toBe(400);
    });

    it('should analyze project and return a structured risk score', async () => {
      // const response = await request(app)
      //   .post('/api/risk/analyze')
      //   .send({ projectId: 'proj-synthetic-002' })
      //   .set('Authorization', 'Bearer MOCK_TOKEN');
      // expect(response.status).toBe(200);
      // expect(response.body).toHaveProperty('riskScore');
      // expect(response.body).toHaveProperty('riskLevel');
      // expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(response.body.riskLevel);
      // expect(response.body).toHaveProperty('reasons');
    });
  });
});
