const winston = require("winston");

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "rejections.log" }),
  ],
  exitOnError: false,
});

module.exports = logger;
