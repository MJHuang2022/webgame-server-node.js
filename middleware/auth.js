const SrvException = require("../util/exception");
const jwtGenerator = require("../util/jwt");
const User = require('../Service/user');

async function auth(req, rsp, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authInfo = req.header("Authorization");
  if (!authInfo) {
    return rsp
      .status(401)
      .send({ error: "Access denied, No authorization provied." });
  }

  try {
    // Authorization: Bearer jwt
    const token = authInfo.split(" ")[1];
    if (!token) {
      throw Error("Invalid authorization.");
    }
    req.user = jwtGenerator.decode(token);
    
    const { _id, email, iat } = req.user;
    const user = await User.get(_id);
    if (user.email !== email) {
      console.log(user, email);
      throw new SrvException(400, "The token is error.");
    }

    if (user.setPasswordDate) {
      const passwordDate = parseInt(user.setPasswordDate.getTime() / 1000, 10);
      if (iat < passwordDate) {
        throw new SrvException(400, "The token is old, need to login again.");
      }
    }

    req.user = user;
    next();
  } catch (e) {
    console.log(e.message);
    return rsp.status(400).send({ error: "Access denied, invalid token." });
  }
}

module.exports = auth;
