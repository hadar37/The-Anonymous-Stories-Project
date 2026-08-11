
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('./server'); // ייבוא השרת
const User = require('./models/user'); // ייבוא המודל

let mongoServer;

describe('Auth Unit & Integration Tests', () => {

  // 1. הגדרת מסד נתונים זמני ב-RAM לפני תחילת הבדיקות
  beforeAll(async () => {
    await mongoose.disconnect(); // ניתוק חיבורים קיימים
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // 2. ניקוי המסד הזמני בין בדיקה לבדיקה
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // 3. סגירת המסד הזמני בסיום כל הבדיקות
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ==========================================
  // הבדיקות עצמן:
  // ==========================================

  // בדיקה 1: הרשמת משתמש חדש בהצלחה עם סיסמה חזקה
  test('1. Should register a new user successfully with strong password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ישראל ישראלי',
        email: 'test@example.com',
        password: 'Pass1234!' // 👈 סיסמה תקינה בעלת 8+ תווים, אותיות, מספרים וסימן מיוחד
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  // בדיקה 2: איסור הרשמה עם סיסמה חלשה (שאינה עומדת במורכבות)
  test('2. Should fail to register with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ישראל ישראלי',
        email: 'weakpass@example.com',
        password: '123' // 👈 סיסמה קצרה ללא אותיות/סימנים
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  // בדיקה 3: איסור הרשמה עם אימייל שכבר קיים במערכת
  test('3. Should fail to register an existing email', async () => {
    await User.create({
      name: 'משתמש קיים',
      email: 'existing@example.com',
      password: 'Pass1234!'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ניסיון נוסף',
        email: 'existing@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'משתמש עם אימייל זה כבר קיים');
  });

  // בדיקה 4: התחברות (Login) עם סיסמה שגויה
  test('4. Should fail login with incorrect password', async () => {
    await User.create({
      name: 'משתמש בדיקה',
      email: 'user@example.com',
      password: 'Pass1234!'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'WrongPassword1!' // 👈 סיסמה שגויה
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'אימייל או סיסמה שגויים');
  });

});