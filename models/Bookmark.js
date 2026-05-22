// Requirements
const { Schema, model } = require("mongoose");

// Bookmark Schema — private resource associated with a single user
const bookmarkSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Associate bookmark with user — ownership reference
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
