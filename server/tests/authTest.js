

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 🟢 תיקון נתיבים: עלייה שלב אחד למעלה מהתיקייה tests
const app = require('../server'); 
const User = require('../models/User'); 

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
  // בדיקות הרשמה והתחברות (Auth)
  // ==========================================

  test('1. Should register a new user successfully with strong password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ישראל ישראלי',
        email: 'test@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  test('2. Should fail to register with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ישראל ישראלי',
        email: 'weakpass@example.com',
        password: '123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

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
        password: 'WrongPassword1!'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'אימייל או סיסמה שגויים');
  });

  test('5. Should fail to register a user with an empty password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'שולה שמרלינג',
        email: 'walla@example.com',
        password: ''
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  test('6. Should fail to register a user with only spaces in name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '         ',
        email: 'spaces@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  // ==========================================
  // בדיקות ולידציה לשם משתמש
  // ==========================================

  test('7. Should fail registration when name is shorter than 2 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'צ',
        email: 'shortname@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  test('8. Should fail registration when name contains numbers', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '8888',
        email: 'numericname@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  test('9. Should register successfully with a valid Hebrew name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'שולה שמרלינג',
        email: 'shula@example.com',
        password: 'Pass1234!'
      });

    expect(res.statusCode).toEqual(201);
  });

});