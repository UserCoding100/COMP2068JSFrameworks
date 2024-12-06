module.exports = {
    // Middleware to ensure the user is authenticated
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next(); // If authenticated, proceeds to the next middleware/route handler
      }
      req.flash('error_msg', 'Please log in to view this resource');
      res.redirect('/login'); // Redirects to the login page if not authenticated
    },
  
    // Middleware to ensure the user is a guest (not logged in)
    ensureGuest: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next(); // If not authenticated, proceed to the next middleware/route handler
      }
      res.redirect('/dashboard'); // Redirects to the dashboard if already logged in
    },
  };
  