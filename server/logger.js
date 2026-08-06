

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// יצירת תיקיית logs במידה ואינה קיימת
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    // 1. הדפסה ברורה לקונסול (בטרמינל)
    new transports.Console(),
    // 2. שמירת כל הלוגים בקובץ app.log
    new transports.File({ filename: path.join(logDir, 'app.log') }),
    // 3. שמירת שגיאות בלבד בקובץ errors.log
    new transports.File({ filename: path.join(logDir, 'errors.log'), level: 'error' })
  ]
});

module.exports = logger;