const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  styles: {
    title: {
      color: String,
      fontSize: String,
      fontFamily: String,
      alignment: String,
      textTransform: String,
      margin: String,
      isBold: Boolean,
      isItalic: Boolean,
      isUnderline: Boolean,
      isStrike: Boolean
    },
    subtitle: {
      color: String,
      fontSize: String,
      fontFamily: String,
      alignment: String,
      textTransform: String,
      margin: String,
      isBold: Boolean,
      isItalic: Boolean,
      isUnderline: Boolean,
      isStrike: Boolean
    }
  },
  imageUrls: {
    logo: String,
    content: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
