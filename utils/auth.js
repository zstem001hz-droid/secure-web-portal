// Requirements
const jwt = require("jsonwebtoken");

// Secret and expiration
const secret = process.env.JWT_SECRET;
const expiration = "2h";

module.exports = {
  // Sign token with non-sensitive user data
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};