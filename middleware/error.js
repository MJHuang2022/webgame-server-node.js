const logger = require("../util/logger");
const SrvException = require("../util/exception");
const fs = require("fs");

module.exports = function (err, req, rsp, next) {
  logger.error(err.message);

  // remove the upload file
  if (req.file) {
    fs.unlink(req.file.path, (errorMsg) => {
      logger.error(errorMsg);
    });
  }

  if (err instanceof SrvException) {
    rsp.status(err.code).send({ error: err.message });
  } else {
    rsp.status(500).send({ error: "Something failed." });
  }
};
