// Requirements
const router = require("express").Router();
const { User } = require("../../models");
const { signToken } = require("../../utils/auth");
const passport = require("passport");

// POST /api/users/register - Create a new user
router.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json(err);
  }
});

// POST /api/users/login - Authenticate a user and return a token
router.post("/login", async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    // Verify password
    const correctPw = await user.isCorrectPassword(req.body.password);

    if (!correctPw) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    // Sign and return token
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json(err);
  }
});

// GET /api/users/auth/github - Initiate GitHub OAuth flow
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GET /api/users/auth/github/callback - GitHub OAuth callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Sign JWT for the authenticated GitHub user
    const token = signToken(req.user);
    res.json({ token, user: req.user });
  },
);

module.exports = router;
