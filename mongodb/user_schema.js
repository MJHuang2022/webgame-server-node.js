const mongoose = require("mongoose");
const joi = require("joi");
const ParamValidation = require("../util/ParamValidation");
const _ = require("lodash");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 255,
    required: true,
    select: false,
  },
  setPasswordDate: { type: Date, required: true },
  resetToken: { type: String, required: false, select: false },
  name: { type: String, required: false, minlength: 5, maxlength: 20 },
  image: { type: String, required: false, maxlength: 255 },
  country: { type: String, required: false, maxlength: 127 },
  address: { type: String, required: false, maxlength: 255 },
  phone: { type: String, required: false, maxlength: 20 },
  age: { type: Number, required: false, min: 1, max: 100 },
});

userSchema.statics.fetchById = function(id, selectProps = null) {
  if (selectProps) {
    return this.findById(id).select(selectProps);
  } else {
    return this.findById(id);
  }
};

userSchema.statics.fetchOne = function(filter, selectProps = null) {
  if (selectProps) {
    return this.findOne(filter).select(selectProps);
  } else {
    return this.findOne(filter);
  }
};

const UserModel = mongoose.model("User", userSchema);

const userParamSchema = {
  email: joi.object({ email: joi.string().min(5).max(255).required().email() }),
  password: joi.object({ password: joi.string().min(8).max(255).required() }),
  confirm_password: joi.object({
    confirm_password: joi.string().min(8).max(255).required(),
  }),
  old_password: joi.object({
    old_password: joi.string().min(8).max(255).required(),
  }),
  reset_token: joi.object({
    reset_token: joi.string().min(8).max(1023).required(),
  }),
  name: joi.object({ name: joi.string().min(5).max(20) }),
  image: joi.object({ image: joi.string().max(255) }),
  country: joi.object({ country: joi.string().max(127) }),
  address: joi.object({ address: joi.string().max(255) }),
  phone: joi.object({ phone: joi.string().max(20) }),
  age: joi.object({ age: joi.number().min(1).max(100) }),
};

const userControllerSchema = {
  signup: {
    validator: new ParamValidation(
      ["name", "email", "password", "confirm_password"],
      userParamSchema
    ),
    rspObject: ["name", "email"],
  },
  signin: {
    validator: new ParamValidation(["email", "password"], userParamSchema),
    rspObject: [
      "email",
      "name",
      "image",
      "country",
      "address",
      "phone",
      "age",
      "jwt",
    ],
  },
  forgot_pwd: {
    validator: new ParamValidation(["email"], userParamSchema),
    rspObject: ["email"],
  },
  reset_pwd: {
    validator: new ParamValidation(
      ["email", "reset_token", "password", "confirm_password"],
      userParamSchema
    ),
    rspObject: ["email"],
  },
  update_pwd: {
    validator: new ParamValidation(
      ["old_password", "password", "confirm_password"],
      userParamSchema
    ),
    rspObject: ["email"],
  },
  delete: {
    validator: new ParamValidation(
      ["password", "confirm_password"],
      userParamSchema
    ),
    rspObject: ["email"],
  },
  update_prop: {
    validator: new ParamValidation(
      ["name", "image", "country", "address", "phone", "age"],
      userParamSchema
    ),
    rspObject: ["email", "name", "image", "country", "address", "phone", "age"],
  },
};

function validate(operation, props) {
  const validator = userControllerSchema[operation].validator;
  if (!validator) {
    throw new Error(`The validator ${operation} doesn't exist.`);
  }

  return validator.validate(props);
}

function getUserInfo(operation, user) {
  const rspObject = userControllerSchema[operation].rspObject;
  const userObj = _.pick(user, rspObject);
  return JSON.stringify(userObj);
}

module.exports = {
  UserModel,
  validate,
  getUserInfo,
};
