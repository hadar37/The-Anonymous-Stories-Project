

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/user');
const Story = require('../models/Story');

let mongoServer;
let user1Token, user1Id;
let user2Token, user2Id;
let createdStoryId;

beforeAll(async () => {
  // 1. הפעלת MongoDB בזיכרון הדינמי לצורך בדיקה נקייה
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // 2. יצירת משתמש ראשון והנפקת טוקן
  const user1Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'משתמש ראשון',
      email: 'user1@example.com',
      password: 'Password123!'
    });
  
  user1Token = user1Res.body.token;
  // תמיכה בכל מבנה תשובה אפשרי מה-API:
  user1Id = user1Res.body.user?._id || user1Res.body.user?.id || user1Res.body._id || user1Res.body.id;

  // 3. יצירת משתמש שני (לערעור הרשאות)
  const user2Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'משתמש שני',
      email: 'user2@example.com',
      password: 'Password123!'
    });

  user2Token = user2Res.body.token;
  user2Id = user2Res.body.user?._id || user2Res.body.user?.id || user2Res.body._id || user2Res.body.id;
});


afterAll(async () => {
  // ניקוי וסגירת החיבור ל-DB הווירטואלי
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Story API Endpoints (/api/stories)', () => {

  // ==========================================
  // 1. בדיקת קבלת סיפורים (GET)
  // ==========================================
  describe('GET /api/stories', () => {
    it('should return status 200 and an array of stories', async () => {
      const res = await request(app).get('/api/stories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ==========================================
  // 2. בדיקת יצירת סיפור (POST)
  // ==========================================
  describe('POST /api/stories', () => {
    it('should fail if user is not authenticated (no token)', async () => {
      const res = await request(app)
        .post('/api/stories')
        .send({
          title: 'סיפור ללא התחברות',
          content: 'תוכן הסיפור...'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should create a story successfully when user is authenticated', async () => {
      const res = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'הסיפור הראשון שלי',
          content: 'זהו תוכן הסיפור הראשון שנוצר בטסט',
          isSuccessStory: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('הסיפור הראשון שלי');
      expect(res.body.author).toBe(user1Id);

      // שמירת ה-ID של הסיפור שנוצר לצורך בדיקות עריכה ומחיקה בהמשך
      createdStoryId = res.body._id;
    });
  });

  // ==========================================
  // 3. בדיקת עריכת סיפור (PUT)
  // ==========================================
  describe('PUT /api/stories/:id', () => {
    it('should forbid user2 from editing user1 story', async () => {
      const res = await request(app)
        .put(`/api/stories/${createdStoryId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'ניסיון עריכה לא מורשה'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('אין לך הרשאה');
    });

    it('should allow story author (user1) to update the story', async () => {
      const res = await request(app)
        .put(`/api/stories/${createdStoryId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'הסיפור הראשון שלי - מעודכן',
          content: 'תוכן מעודכן של הסיפור'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('הסיפור הראשון שלי - מעודכן');
      expect(res.body.content).toBe('תוכן מעודכן של הסיפור');
    });
  });

  // ==========================================
  // 4. בדיקת מחיקת סיפור (DELETE)
  // ==========================================
  describe('DELETE /api/stories/:id', () => {
    it('should forbid user2 from deleting user1 story', async () => {
      const res = await request(app)
        .delete(`/api/stories/${createdStoryId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow story author (user1) to delete the story', async () => {
      const res = await request(app)
        .delete(`/api/stories/${createdStoryId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('נמחק בהצלחה');

      // אימות שהסיפור אכן נמחק מה-Database
      const deletedStory = await Story.findById(createdStoryId);
      expect(deletedStory).toBeNull();
    });

    it('should return 404 when trying to delete a non-existing story', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/stories/${fakeId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(404);
    });
  });

});