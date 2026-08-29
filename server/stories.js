
const express = require('express');
const router = express.Router();
const Story = require('./models/story'); // ודאו שהנתיב תואם למבנה התיקיות
const { protect } = require('./auth');
const crypto = require('crypto');
// ==========================================
// 1. קבלת כל הסיפורים (פתוח לכולם)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 }); // מיון מהחדש לישן
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. יצירת סיפור חדש (משתמש מחובר בלבד)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { storyID, title, content, isSuccessStory } = req.body;

    const story = await Story.create({
      storyID,
      title,
      content,
      isSuccessStory: isSuccessStory || false,
      author: req.user._id // משייך את הסיפור למשתמש המחובר כעת
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==========================================
// 3. עריכת סיפור (המחבר בלבד)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'סיפור לא נמצא' });
    }

    // בדיקה אם המשתמש המחובר הוא מחבר הסיפור
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'אין לך הרשאה לערוך סיפור זה' });
    }

    // עדכון השדות במידה ונשלחו
    if (req.body.title !== undefined) story.title = req.body.title;
    if (req.body.content !== undefined) story.content = req.body.content;
    if (req.body.isSuccessStory !== undefined) story.isSuccessStory = req.body.isSuccessStory;

    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4. מחיקת סיפור (המחבר או אדמין בלבד)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'סיפור לא נמצא' });
    }

    // בדיקת הרשאות: מותר למחוק רק אם המשתמש הוא אדמין או מחבר הסיפור
    const isAuthor = story.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק סיפור זה' });
    }

    await story.deleteOne();
    res.json({ message: 'הסיפור נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;