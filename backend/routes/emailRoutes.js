const express = require('express');
const EmailTemplate = require('../models/EmailTemplate');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

router.post('/uploadEmailConfig', async (req, res) => {
  try {
    const emailTemplate = new EmailTemplate(req.body);
    await emailTemplate.save();
    res.json({ message: 'Template saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving template' });
  }
});

router.post('/renderAndDownloadTemplate', async (req, res) => {
  try {
    const emailConfig = req.body;
    const layoutPath = path.join(__dirname, '../templates/layout.html');
    const layout = await fs.readFile(layoutPath, 'utf8');
    
    let rendered = layout;
    Object.keys(emailConfig).forEach(key => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), emailConfig[key]);
    });
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=email-template.html');
    res.send(rendered);
  } catch (error) {
    res.status(500).json({ error: 'Error rendering template' });
  }
});

module.exports = router;
