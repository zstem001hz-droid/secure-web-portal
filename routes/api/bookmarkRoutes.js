// Requirements
const router = require("express").Router();
const { Bookmark } = require("../../models");
const { authMiddleware } = require("../../utils/auth");

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// POST /api/bookmarks - Create a new bookmark
router.post("/", async (req, res) => {
  try {
    const bookmark = await Bookmark.create({
      ...req.body,
      // Associate bookmark with logged-in user
      user: req.user._id,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json(err);
  }
});

// GET /api/bookmarks - Get all bookmarks for logged-in user
router.get("/", async (req, res) => {
  try {
    // Only return bookmarks owned by the logged-in user
    const bookmarks = await Bookmark.find({ user: req.user._id });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json(err);
  }
});
