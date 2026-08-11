

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./logger');

// ייבוא הנתיבים
const storyRoutes = require('./stories');
const { router: authRoutes } = require('./auth');
const adminRoutes = require('./authAdmin');


const app = express();
app.use(express.json()); // לפענוח JSON

// Middleware

app.use('/api/admin', adminRoutes);

app.use(cors()); // מאפשר ל-React לתקשר עם השרת

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 1. נתיבים פתוחים (התחברות והרשמה)
app.use('/api/auth', authRoutes);


// 2. נתיבים מוגנים (למשל סיפורים)
app.use('/api/stories', storyRoutes);

// נתיב בסיסי לבדיקת תקינות
app.get('/', (req, res) => {
  res.send('API is running...');
});

// התחברות ל-MongoDB והרצת השרת - רק מחוץ לסביבת בדיקות (Jest)
if (process.env.NODE_ENV !== 'test') {
  // התחברות ל-MongoDB
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Successfully connected to MongoDB!'))
    .catch((err) => console.error('🔴 MongoDB connection error:', err));

  // הרצת השרת
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ייצוא ה-app עבור Jest ו-Supertest
module.exports = app;