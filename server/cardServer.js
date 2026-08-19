


const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./logger');

const app = express();
const PORT = process.env.CARD_PORT || 5001;

// מאפשר לקומפוננטת ה-React (שרצה למשל ב-localhost:3000/5173) לפנות לשרת הזה
app.use(cors());
app.use(express.json());

app.use(morgan(':method :url :status - :response-time ms', {
  stream: {
    write: (message) => logger.info(`[שרת קלפים] ${message.trim()}`)
  }
}));



// מאגר קלפי השראה ומוטיבציה
const inspirationCards = [
  {
    id: 1,
    message: "יש בך את הכוחות להגשים את החלומות שלך, גם כשהדרך נראית מאתגרת.",
    category: "חזק והעצמה"
  },
  {
    id: 2,
    message: "כל צעד קטן שאת/ה עושה היום, מקרב אותך למקום טוב ושלם יותר מחר.",
    category: "התקדמות"
  },
  {
    id: 3,
    message: "מותר לך לקחת הפסקה, לנשום עמוק ולזכור שאת/ה עושה כמיטב יכולתך.",
    category: "חמלה עצמית"
  },
  {
    id: 4,
    message: "הסערה תחלוף, והשמש תמיד תזרח מחדש. החזק/י מעמד.",
    category: "תקווה"
  },
  {
    id: 5,
    message: "הסיפור שלך עדיין נכתב, והפרקים הכי יפים עוד לפניך.",
    category: "התחלה חדשה"
  },
  {
    id: 6,
    message: "אל תפחד/י לבקש עזרה. לפעמים הצעד האמיץ ביותר הוא פשוט לא להיות לבד.",
    category: "אומץ"
  },
  {
    id: 7,
    message: "את/ה ראוי/ה לאהבה, לקבלה ולהקשבה - קודם כל מעצמך.",
    category: "ערך עצמי"
  },
  {
    id: 8,
    message: "גם עץ חזק צומח מגרעין קטן שנשאר מתחת לאדמה בחושך. מתוך החושך צומחת צמיחה.",
    category: "חוסן"
  }
];

// הראוט שמחזיר קלף רנדומלי מתוך המאגר
app.get('/api/cards/random', (reactReq, res) => {
  const randomIndex = Math.floor(Math.random() * inspirationCards.length);
  const randomCard = inspirationCards[randomIndex];
  
  res.json(randomCard);
});

// הראוט שמחזיר את כל הקלפים (במידה ותרצה להציג את כולם בעתיד)
app.get('/api/cards', (reactReq, res) => {
  res.json(inspirationCards);
});


// ייצוא האפליקציה לצורך טסטים (Supertest)
module.exports = app;

// הפעלת האזנה לפורט רק אם הקובץ מורץ ישירות ולא בזמן בדיקות Jest
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🎴 שרת קלפי ההשראה פועל בהצלחה על פורט ${PORT}`);
  });
}

