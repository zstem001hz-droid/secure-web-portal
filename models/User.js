// Requirements
const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

// User Schema - supports both local and GitHub OAuth authentication
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must use a valid email address"],
  },

  // Local auth - not required for GitHub OAuth users
  password: {
    type: String,
    minlength: 8,
  },

  // GitHub OAuth - not required for local auth users
  githubId: {
    type: String,
  },
});

// Pre-save hook to hash password — only fires if password is present
userSchema.pre("save", async function () {
  if (this.password && (this.isNew || this.isModified("password"))) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});
