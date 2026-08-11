
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const bcrypt = require('bcrypt');

const router = express.Router();


// ==========================================
// 1. פונקציית עזר ליצירת JWT Token
// ==========================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // התוקף של הטוקן (למשל: 30 יום)
  });
};





// ==========================================
// 2. Middleware לאימות המשתמש (Protect)
// ==========================================
const protect = async (req, res, next) => {
  let token;

  // בדיקה אם נשלח טוקן ב-Headers תחת Authorization (בפורמט: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // חילוץ הטוקן מהמחרוזת
      token = req.headers.authorization.split(' ')[1];

      // פענוח הטוקן
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // מציאת המשתמש ב-DB (ללא הסיסמה) והצמדתו לאובייקט req
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'משתמש לא נמצא' });
      }

      next(); // המשתמש מאומת - ממשיכים לבקשה הבאה!
    } catch (error) {
      return res.status(401).json({ message: 'טוקן לא תקין או פג תוקף' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'אין הרשאה, לא נשלח טוקן' });
  }
};

// ==========================================
// 3. נתיבי התחברות והרשמה (Routes)
// ==========================================

// הרשמת משתמש חדש (Register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔒 אימות מורכבות הסיסמה: לפחות 8 תווים, אותיות באנגלית, מספרים וסימן מיוחד (!@#$%^&*)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'הסיסמה חייבת להכיל לפחות 8 תווים, אותיות באנגלית, מספרים ואחד מהסימנים המיוחדים: !,@,#,$,%,^,&,*' 
      });
    }

    // בדיקה אם המשתמש כבר קיים
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
    }

    // יצירת המשתמש (הסיסמה תוצפן אוטומטית ע"י ה-Schema של Mongoose)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// התחברות משתמש קיים (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // מציאת המשתמש כולל שדה הסיסמה המוצפן
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ייצוא ה-Router וגם ה-Middleware
module.exports = { router, protect };