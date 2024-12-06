const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Local users
const GitHubUser = require('../models/GitHubUser'); // GitHub users

module.exports = (passport) => {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
      try {
        // Find users by username
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'No user found with this username' });
        }

        // Match passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      } catch (err) {
        console.error(err);
        return done(err);
      }
    })
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET, 
        callbackURL: '/auth/github/callback', // Callback URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          
          let user = await GitHubUser.findOne({ githubId: profile.id }); 
          if (!user) {
            user = new GitHubUser({
              githubId: profile.id,
              username: profile.username,
              email: profile.emails ? profile.emails[0].value : undefined, // Checks if email is available
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          console.error(err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize User
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize User
  passport.deserializeUser(async (id, done) => {
    try {
      // Checks in both collections
      const user =
        (await User.findById(id)) || (await GitHubUser.findById(id));
      done(null, user);
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  });
};
