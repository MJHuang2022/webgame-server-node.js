const User = require("../Service/user");
const jwtGenerator = require("../util/jwt");
const _ = require("lodash");

const signupUser = async (req, rsp) => {
  const user = new User(req);
  const result = await user.create();
  return rsp.status(201).send(result);
};

const signinUser = async (req, rsp) => {
  const user = new User(req);
  const result = await user.signin();
  return rsp.status(200).send(result);
};

const forgotpwd = async (req, rsp) => {
  const user = new User(req);
  const result = await user.forgotpwd();
  return rsp.status(200).send(result);
};

const resetpwd = async (req, rsp) => {
  const user = new User(req);
  const result = await user.resetpwd();
  return rsp.status(200).send(result);
};

module.exports = { signupUser, signinUser, forgotpwd, resetpwd };
