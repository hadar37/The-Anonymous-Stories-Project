
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'נא להזין שם'],
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'נא להזין סיסמה'],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/.test(v);
        },
        message: 'הסיסמה חייבת להכיל לפחות 8 תווים, אותיות באנגלית, מספרים ואחד מהסימנים המיוחדים: !,@,#,$,%,^,&,*'
      },
      select: false
    }, // <-- כאן הייתה סגירה מיותרת בשימוש ב-}}
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Middleware: הרצה לפני שמירת משתמש (create או save)
// 🟢 התיקון: הסרת next() מ-async function
userSchema.pre('save', async function () {
  // אם הסיסמה לא שונתה (למשל בעדכון פרטים אחרים), אין צורך להצפין שוב
  if (!this.isModified('password')) return;

  // יצירת Salt והצפנת הסיסמה (אם יש שגיאה, async/await יזרוק אותה אוטומטית)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// מתודה מותאמת אישית להשוואת סיסמאות בזמן התחברות (Login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;