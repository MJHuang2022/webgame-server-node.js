const jwt = require("jsonwebtoken");
const config = require("config");

const JWT_EXPORESIN = "1h";

class JwtGenerator {
  constructor() {
    this.privateKey = config.get("Jwt.PrivateKey");
  }

  generate(info, expiresIn = JWT_EXPORESIN) {
    return jwt.sign(info, this.privateKey, { expiresIn });
  }

  decode(token) {
    return jwt.verify(token, this.privateKey);
  }
}

const jwtGenerator = new JwtGenerator();

module.exports = jwtGenerator;
