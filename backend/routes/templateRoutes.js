const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

router.get('/getEmailLayout', async (req, res) => {
  try {
    const layoutPath = path.join(__dirname, '../templates/layout.html');
    const layout = await fs.readFile(layoutPath, 'utf8');
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ error: 'Error reading template file' });
  }
});

module.exports = router;
