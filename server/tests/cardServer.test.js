

const request = require('supertest');
const app = require('./cardServer');

describe('CardServer API Endpoints', () => {

  // בדיקת הנתיב לקבלת קלף רנדומלי
  describe('GET /api/cards/random', () => {
    it('should return status 200 and a single card object', async () => {
      const res = await request(app).get('/api/cards/random');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('category');
    });

    it('should return valid data types for card properties', async () => {
      const res = await request(app).get('/api/cards/random');

      expect(typeof res.body.id).toBe('number');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.category).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  // בדיקת הנתיב לקבלת כל הקלפים
  describe('GET /api/cards', () => {
    it('should return status 200 and an array of cards', async () => {
      const res = await request(app).get('/api/cards');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should ensure every card in the array has required properties', async () => {
      const res = await request(app).get('/api/cards');

      res.body.forEach((card) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('message');
        expect(card).toHaveProperty('category');
      });
    });
  });

  // בדיקת טיפול בנתיב שאינו קיים
  describe('GET /api/invalid-route', () => {
    it('should return status 404 for non-existing endpoints', async () => {
      const res = await request(app).get('/api/invalid-route');

      expect(res.statusCode).toBe(404);
    });
  });

});