const express = require("express");
const auth = require("../middleware/auth");
const {
  getUserInfo,
  updateUserInfo,
  updateUserPwd,
  deleteUser,
} = require("./user_controllor");
const { imageUpload } = require("../middleware/image_upload");
const validator = require("../middleware/validator");

const userRouter = express.Router();
userRouter.use(auth);

userRouter
  .route("/")
  .delete(validator("delete"), deleteUser)
  .post(validator("update_pwd"), updateUserPwd);

userRouter.patch(
  "/",
  imageUpload.single("image"),
  validator("update_prop"),
  updateUserInfo
);

module.exports = userRouter;
