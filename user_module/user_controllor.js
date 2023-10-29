const User = require("../Service/user");

const getUserInfo = async (req, rsp) => {
  const user = new User(req);
  const result = await user.get();
  return rsp.status(200).send(result);
};

const updateUserInfo = async (req, rsp) => {
  const user = new User(req);
  const result = await user.updateProp();
  return rsp.status(200).send(result);
};

const updateUserPwd = async (req, rsp) => {
  const user = new User(req);
  const result = await user.updatePwd();
  return rsp.status(200).send(result);
};

const deleteUser = async (req, rsp) => {
  const user = new User(req);
  const result = await user.remove();
  return rsp.status(200).send(result);
};

module.exports = { getUserInfo, updateUserInfo, updateUserPwd, deleteUser };
