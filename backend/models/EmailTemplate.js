const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  content: String,
  logoUrl: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);