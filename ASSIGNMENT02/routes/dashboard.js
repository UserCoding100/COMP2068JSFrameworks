const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Expense = require('../models/Expense');

// Valid Categories
const validCategories = [
  'Food',
  'Travel',
  'Entertainment',
  'Other',
  'Utilities',
  'Healthcare',
  'Education',
  'Shopping',
  'Savings',
  'Subscriptions',
];

// Dashboard Route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all expenses for the logged-in user
    const expenses = await Expense.find({ user: req.user._id });

    // Calculate Monthly Total
    const currentMonth = new Date().getMonth();
    const monthlyTotal = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth) {
        total += parseFloat(expense.amount);
      }
      return total;
    }, 0);

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      expenses,
      monthlyTotal: monthlyTotal.toFixed(2),
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    req.flash('error_msg', 'Failed to load dashboard');
    res.redirect('/login');
  }
});

// API Endpoint for Chart Data
router.get('/chart-data', ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all expenses for the logged-in user
    const expenses = await Expense.find({ user: req.user._id });

    // Prepare Chart Data
    const chartData = validCategories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    expenses.forEach((expense) => {
      if (chartData[expense.category] !== undefined) {
        chartData[expense.category] += parseFloat(expense.amount);
      }
    });

    // Generate Data for Line Chart (Monthly Trends)
    const monthlyTrends = Array(12).fill(0);
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      monthlyTrends[expenseDate.getMonth()] += parseFloat(expense.amount);
    });

    res.json({
      success: true,
      data: {
        categories: Object.keys(chartData),
        amounts: Object.values(chartData),
        monthlyTrends,
      },
    });
  } catch (err) {
    console.error('Error fetching chart data:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch chart data' });
  }
});

// Add Expense
router.post('/add-expense', ensureAuthenticated, async (req, res) => {
  const { title, amount, category, date } = req.body;
  if (!validCategories.includes(category)) {
    req.flash('error_msg', 'Invalid category selected');
    return res.redirect('/dashboard');
  }
  try {
    const newExpense = new Expense({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
    });
    await newExpense.save();
    req.flash('success_msg', 'Expense added successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error adding expense:', err);
    req.flash('error_msg', 'Failed to add expense');
    res.redirect('/dashboard');
  }
});

// Edit Expense - Render Edit Page
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      req.flash('error_msg', 'Expense not found');
      return res.redirect('/dashboard');
    }

    // Prepare categories for dropdown
    const categoryOptions = validCategories.map((category) => ({
      name: category,
      selected: category === expense.category ? 'selected' : '',
    }));

    res.render('edit-expense', { expense, categoryOptions });
  } catch (err) {
    console.error('Error loading expense for editing:', err);
    req.flash('error_msg', 'Failed to load expense for editing');
    res.redirect('/dashboard');
  }
});

// Edit Expense - Handle Update
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  const { title, amount, category, date } = req.body;
  if (!validCategories.includes(category)) {
    req.flash('error_msg', 'Invalid category selected');
    return res.redirect('/dashboard');
  }
  try {
    await Expense.findByIdAndUpdate(req.params.id, {
      title,
      amount: parseFloat(amount),
      category,
      date,
    });
    req.flash('success_msg', 'Expense updated successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating expense:', err);
    req.flash('error_msg', 'Failed to update expense');
    res.redirect('/dashboard');
  }
});

// Delete Expense
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Expense deleted successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error deleting expense:', err);
    req.flash('error_msg', 'Failed to delete expense');
    res.redirect('/dashboard');
  }
});

module.exports = router;
