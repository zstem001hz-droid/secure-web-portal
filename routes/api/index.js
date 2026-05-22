// Requirements
const router = require("express").Router();
const userRoutes = require("./userRoutes");
const bookmarkRoutes = require("./bookmarkRoutes");

// Mount user and bookmark routes
router.use("/users", userRoutes);
router.use("/bookmarks", bookmarkRoutes);

module.exports = router;
