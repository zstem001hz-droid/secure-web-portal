// Requirements
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { User } = require("../models");

// Configure GitHub OAuth strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    // Verify callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user if first time
        const newUser = await User.create({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails[0].value,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
