// Requirements
const router = require("express").Router();
const { User } = require("../../models");
const { signToken } = require("../../utils/auth");
const passport = require("passport");