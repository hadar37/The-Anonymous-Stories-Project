
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // מייבאים את אפליקציית ה-Express
const User = require('../models/User');

describe('Auth Unit & Integration Tests', () => {

 

  // סגירת החיבור ל-MongoDB בסיום כל הבדיקות
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // בדיקה 1: הרשמת משתמש חדש בהצלחה
  test('1. Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ישראל ישראלי',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  // בדיקה 2: איסור הרשמה עם אימייל שכבר קיים במערכת
  test('2. Should fail to register an existing email', async () => {
    // יצירת משתמש קיים
    await User.create({
      name: 'משתמש קיים',
      email: 'existing@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'ניסיון נוסף',
        email: 'existing@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'משתמש עם אימייל זה כבר קיים');
  });

  // בדיקה 3: התחברות (Login) עם סיסמה שגויה
  test('3. Should fail login with incorrect password', async () => {
    await User.create({
      name: 'משתמש בדיקה',
      email: 'user@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'wrongPassword' // סיסמה שגויה
      });


      // בסיום כל הבדיקות - מנקים רק את המשתמשים שנוצרו בטסטים האלה
afterAll(async () => {
  await User.deleteMany({ 
    email: { $in: ['test@example.com', 'existing@example.com', 'user@example.com'] } 
  });
  await mongoose.connection.close();
});

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'אימייל או סיסמה שגויים');
  });

});



{
  "message": "התחברת בהצלחה כמנהל מערכת",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNzRhYWFjNmQyMjNlYzVjNDBlYTgxYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjAzMDk5MiwiZXhwIjoxNzg2MTE3MzkyfQ.fGpO5NkezrJG67aJtGANHqn4GS6zdJ99TLDQyUR5Pgs",
  "user": {
    "id": "6a74aaac6d223ec5c40ea81a",
    "name": "מנהל מערכת",
    "email": "admin@example.com",
    "role": "admin"
  }
}

id
6a7235dfb7cf4e2c365ff502

{
  "_id": "6a74b0aa6d223ec5c40ea81b",
  "name": "Happy_dolphin",
  "email": "dolphin@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNzRiMGFhNmQyMjNlYzVjNDBlYTgxYiIsImlhdCI6MTc4NjAzMjI5OCwiZXhwIjoxNzg4NjI0Mjk4fQ.GNDy8R-OkE0gcUY6D--X1kO2arvClf8SVJMcMq8knME"
}

{
  "_id": "6a74b0aa6d223ec5c40ea81b",
  "name": "Happy_dolphin",
  "email": "dolphin@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNzRiMGFhNmQyMjNlYzVjNDBlYTgxYiIsImlhdCI6MTc4NjAzMjUxNCwiZXhwIjoxNzg4NjI0NTE0fQ.iq-Y0aGI2e4E2w3WPeAzOcgQ2hWnKZ2g7C4tCUPBxKU"
}