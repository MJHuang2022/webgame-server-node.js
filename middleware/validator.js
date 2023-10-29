const { validate } = require("../mongodb/user_schema");
module.exports = function (operation) {
  return function (req, res, next) {
    const { isValid, params } = validate(operation, req.body);
    if (!isValid) {
      throw new SrvException(400, `The params of ${operation} is error.`);
    }

    req.params = params;
    next();
  };
};
