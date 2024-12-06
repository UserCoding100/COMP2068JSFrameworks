const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');
const router = express.Router();

// Register Page
router.get('/register', ensureGuest, (req, res) => {
  res.render('register', { title: 'Register' });
});

// Handle Registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  let errors = [];

  // Input validation
  if (!username || !password) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', {
      errors,
      username,
      password,
      title: 'Register',
    });
  }

  try {
    // Checks if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error_msg', 'Username already exists');
      return res.redirect('/register');
    }

    // Creates new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/register');
  }
});

// Login Page
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post(
  '/login',
  (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard', // Redirect to dashboard on success
      failureRedirect: '/login', // Redirect back to login on failure
      failureFlash: true, // Show flash messages for errors
    })(req, res, next);
  }
);

// GitHub Login Initiation
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/dashboard', // Redirects to dashboard on success
    failureRedirect: '/login', // Redirects back to login on failure
    failureFlash: true, // Show flash messages for errors
  })
);

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      req.flash('error_msg', 'Error logging out');
      return res.redirect('/dashboard');
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
