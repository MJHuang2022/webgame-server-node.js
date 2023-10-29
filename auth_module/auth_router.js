const express = require("express");
const {
  signupUser,
  signinUser,
  forgotpwd,
  resetpwd,
} = require("./auth_controllor");
const validator = require("../middleware/validator");

const authRoutor = express.Router();

authRoutor.route("/signup").post(validator("signup"), signupUser);
authRoutor.route("/signin").post(validator("signin"), signinUser);
authRoutor.route("/forgotpwd").post(validator("forgot_pwd"), forgotpwd);
authRoutor.route("/resetpwd").post(validator("reset_pwd"), resetpwd);

module.exports = authRoutor;
