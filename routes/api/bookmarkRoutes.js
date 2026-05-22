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

// GET /api/bookmarks/:id - Get a single bookmark by ID
router.get("/:id", async (req, res) => {
  try {
    // Find bookmark by ID
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res
        .status(404)
        .json({ message: "No bookmark found with this id!" });
    }

    // Check ownership before returning
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to view this bookmark." });
    }

    res.json(bookmark);
  } catch (err) {
    res.status(500).json(err);
  }
});
