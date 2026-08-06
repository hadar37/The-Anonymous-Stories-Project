


const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const router = express.Router();
const Story = require('./models/story'); // נתיב למודל הסיפורים
const logger = require('./logger');





// ==========================================
// 1. פונקציית עזר ליצירת JWT Token
// ==========================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // התוקף של הטוקן (למשל: 30 יום)
  });
};

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'גישה נדחתה. חסר טוקן אימות' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    // שליפת המשתמש מהמסד
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      logger.warn(`ניסיון גישה בלתי מורשה לנתיב אדמין על ידי משתמש ID: ${decoded.id}`);
      return res.status(403).json({ message: 'גישה נדחתה. הרשאת מנהל (Admin) נדרשת' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`שגיאת אימות טוקן אדמין: ${error.message}`);
    return res.status(401).json({ message: 'טוקן לא תקף או פג תוקף' });
  }
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
// 1. ראוט ליצירת משתמש אדמין חדש
// POST /api/admin/register
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
    }

    // יצירת משתמש מנהל חדש מפורשות עם role: 'admin'
    const adminUser = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    await adminUser.save();
    logger.info(`נוצר אדמין חדש בהצלחה: ${email}`);

    res.status(201).json({
      message: 'משתמש אדמין נוצר בהצלחה',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    logger.error(`שגיאה ביצירת אדמין: ${error.message}`);
    res.status(500).json({ message: 'שגיאה ביצירת אדמין', error: error.message });
  }
});



// 2. ראוט להתחברות אדמין (Login)
// POST /api/admin/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'נא להזין אימייל וסיסמה' });
    }

    // שליפת המשתמש כולל הסיסמה
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'פרטי התחברות שגויים או שאינך מנהל מערכת' });
    }

    // אימות סיסמה
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'פרטי התחברות שגויים' });
    }

    // הנפקת JWT Token עם הרשאת admin
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    logger.info(`אדמין התחבר בהצלחה: ${email}`);

    res.status(200).json({
      message: 'התחברת בהצלחה כמנהל מערכת',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`שגיאת התחברות אדמין: ${error.message}`);
    res.status(500).json({ message: 'שגיאת שרת בהתחברות אדמין', error: error.message });
  }
});

// ==========================================
// 3. ראוט למחיקת משתמש (מוגן - Admin בלבד)
// DELETE /api/admin/users/:id
// ==========================================
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    await User.findByIdAndDelete(userId);
    
    // אופציונלי: מחיקת כל הסיפורים של אותם משתמשים שנמחקו
    await Story.deleteMany({ author: userId });

    logger.info(`אדמין (${req.user.email}) מחק את המשתמש: ${userId}`);
    res.status(200).json({ message: 'המשתמש והסיפורים השייכים לו נמחקו בהצלחה' });
  } catch (error) {
    logger.error(`שגיאה במחיקת משתמש: ${error.message}`);
    res.status(500).json({ message: 'שגיאה במחיקת משתמש', error: error.message });
  }
});

// ==========================================
// 4. ראוט למחיקת סיפור (מוגן - Admin בלבד)
// DELETE /api/admin/stories/:id
// ==========================================
router.delete('/stories/:id', verifyAdmin, async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'סיפור לא נמצא' });
    }

    await Story.findByIdAndDelete(storyId);

    logger.info(`אדמין (${req.user.email}) מחק את הסיפור ID: ${storyId}`);
    res.status(200).json({ message: 'הסיפור נמחק בהצלחה על ידי המנהל' });
  } catch (error) {
    logger.error(`שגיאה במחיקת סיפור: ${error.message}`);
    res.status(500).json({ message: 'שגיאה במחיקת סיפור', error: error.message });
  }
});

module.exports = router;


