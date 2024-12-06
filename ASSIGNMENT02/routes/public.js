const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Adjust collection as needed

// Public Page Route
router.get('/', async (req, res) => {
  try {
    // Fetch all documents from the Expense collection
    const expenses = await Expense.find().lean();

    // Render the public page with data
    res.render('public', {
      title: 'Public Expenses',
      expenses, // Pass fetched data to the template
    });
  } catch (err) {
    console.error('Error fetching public data:', err);
    res.status(500).send('An error occurred while fetching data.');
  }
});

module.exports = router;
