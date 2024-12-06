const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('public-data', { title: 'Public Data' });
});

module.exports = router; // Ensures this exports the `router`
