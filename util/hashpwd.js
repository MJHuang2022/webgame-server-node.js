const bcrypt = require("bcrypt");

class SecurityCode {
  async encode(src) {
    const salt = await bcrypt.genSalt(10);
    const dist = await bcrypt.hash(src, salt);
    return dist;
  }
  
  async isValid(src, encodePwd) {
    const isValid = await bcrypt.compare(src, encodePwd);
    return isValid;
  }
}

const securityCode = new SecurityCode();

module.exports = securityCode;