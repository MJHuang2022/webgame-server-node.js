const { UserModel, validate, getUserInfo } = require("../mongodb/user_schema");
const _ = require("lodash");
const securityCode = require("../util/hashpwd");
const SrvException = require("../util/exception");
const fs = require("fs");
const logger = require("../util/logger");
const jwtGenerator = require("../util/jwt");
const { getImageFilePath } = require("../middleware/image_upload");
const { sendEmail } = require("../util/email");
const crypto = require("node:crypto");
const objectId = require("../mongodb/objectid");

function removeImageFile(email, imagePath) {
  if (!imagePath) {
    return;
  }

  if (imagePath.length != 0) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        logger.error(
          `failed to unlink the image(${email}, ${imagePath}), ${err}.`
        );
      }
    });
  }
}

function hashResetToken(resetToken) {
  return crypto.createHash("sha256").update(resetToken).digest("hex");
}

function createResetToken(user) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = hashResetToken(resetToken);
  return jwtGenerator.generate({ email: user.email, resetToken }, "10m");
}

class User {
  constructor(req) {
    this.req = req;
    this.params = req.params;
  }

  async signin() {
    let user = await UserModel.fetchOne(
      { email: this.params.email },
      "+password"
    );
    if (!user) {
      throw new SrvException(400, "Faild to authentic user.");
    }

    const isValid = await securityCode.isValid(
      this.params.password,
      user.password
    );

    if (!isValid) {
      throw new SrvException(400, "Faild to authentic user.");
    }

    user = user.toObject();
    const authInfo = _.pick(user, ["_id", "email"]);
    const token = await jwtGenerator.generate(authInfo);
    const userObj = { ...user, jwt: token };
    return getUserInfo("signin", userObj);
  }

  async create() {
    const { email, password, confirm_password } = this.params;
    if (password !== confirm_password) {
      throw new SrvException(400, "The confirm password is error.");
    }

    const user = await UserModel.fetchOne({ email });
    if (user) {
      throw new SrvException(400, "failed to create user.");
    }

    const hashCode = await securityCode.encode(password);
    const newUser = new UserModel({
      ...this.params,
      password: hashCode,
      setPasswordDate: Date.now(),
    });
    await newUser.save();
    return getUserInfo("signup", newUser);
  }

  static async get(id) {
    const user = await UserModel.fetchById(objectId.toId(id));
    if (!user) {
      throw new SrvException(400, "The user not exist.");
    }

    return user;
  }

  async updateProp() {
    let oldImgPath = null;
    const user = this.req.user;
    let updateProperty = this.params;
    if (this.req.file) {
      updateProperty = _.omit(this.params, ["image"]);
      updateProperty = {
        ...updateProperty,
        image: this.req.file.filename,
      };
      oldImgPath = user.image;
    }

    _.forIn(updateProperty, (value, key) => {
      user.set(key, value);
    });

    await user.save();

    removeImageFile(user.email, getImageFilePath(oldImgPath));
    return getUserInfo("update_prop", user);
  }

  async updatePwd() {
    const { old_password, password, confirm_password } = this.params;
    if (password !== confirm_password) {
      throw new SrvException(400, "The confirm password is error.");
    }

    let user = await UserModel.fetchById(this.req.user._id, "+password");
    const isValid = await securityCode.isValid(old_password, user.password);
    if (!isValid) {
      throw new SrvException(400, "Faild to authentic user.");
    }

    user.password = await securityCode.encode(password);
    user.setPasswordDate = Date.now();
    await user.save();

    return getUserInfo("update_pwd", user);
  }

  async remove() {
    const user = await UserModel.fetchById(this.req.user._id, "+password");
    const isValid = await securityCode.isValid(
      this.params.password,
      user.password
    );
    if (!isValid) {
      throw new SrvException(400, "Faild to authentic user.");
    }

    const condition = _.pick(user, ["_id", "email"]);
    await UserModel.deleteOne(condition);

    removeImageFile(user.email, user.image);
    return getUserInfo("delete", user);
  }

  async forgotpwd() {
    const { email } = this.params;
    const user = await UserModel.fetchOne({ email });
    if (!user) {
      throw new SrvException(400, "The email is error.");
    }

    const reset_token = createResetToken(user);
    await user.save();
    const message = `Here is your reset token(which is inside the [], you can copy it to reset the password).
    [${reset_token}]`;

    sendEmail({
      email,
      subject: "Your password reset token(valid for 10min)",
      message,
    });

    return getUserInfo("forgot_pwd", user);
  }

  async resetpwd() {
    const { email, password, confirm_password, reset_token } = this.params;
    if (password !== confirm_password) {
      throw new SrvException(400, "The confirm password is error.");
    }

    try {
      const decodeToken = jwtGenerator.decode(reset_token);
      if (email != decodeToken.email) {
        throw new SrvException(400, "The reset token is error.");
      }

      const { resetToken } = decodeToken;
      const hashToken = hashResetToken(resetToken);
      const user = await UserModel.fetchOne({ email, resetToken: hashToken });
      if (!user) {
        throw new SrvException(400, "The reset token is error.");
      }

      user.password = await securityCode.encode(password);
      user.setPasswordDate = Date.now();
      user.resetToken = "";
      await user.save();
      return getUserInfo("reset_pwd", user);
    } catch (error) {
      logger.error(error.message);
      throw new SrvException(
        400,
        "The reset token is invalid, please try fetch it again."
      );
    }
  }
}

module.exports = User;
