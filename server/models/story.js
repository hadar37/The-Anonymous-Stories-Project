
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'נא להזין כותרת'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'נא להזין תוכן לסיפור']
    },
    isSuccessStory: {
      type: Boolean,
      default: false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
module.exports = Story;