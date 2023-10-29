const mongoose = require("mongoose");

class ObjectId {
  toId(str) {
    return new mongoose.Types.ObjectId(str);
  }
  
  toStr(objId) {
    return objId.toString();
  }
}

const objectId = new ObjectId();

module.exports = objectId;
