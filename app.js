const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const authRouter = require("./auth_module/auth_router");
const userRouter = require("./user_module/user_router");
const dbConnection = require("./mongodb/mongodb_op");
const err = require("./middleware/error");
const config = require("config");
const path = require("path");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

async function startApp() {
  const app = express();

  await dbConnection.connect();

  app.use(bodyParser.json());
  app.use(hpp());
  app.use(mongoSanitize());

  app.use("/images", express.static(path.join("uploads", "images")));

  app.use((req, rsp, next) => {
    rsp.setHeader("Access-Control-Allow-Origin", "*");
    rsp.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    rsp.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

    next();
  });
  app.use(helmet());

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use(err);

  const port = config.get("Http.Port");

  app.listen(port, () => {
    console.log(`Listening to ${port}`);
  });

  process.on("exit", async (code) => {
    await dbConnection.disconnect();
    console.log(`About to exit with code: ${code}`);
  });

  process.on("SIGABRT", async (code) => {
    await dbConnection.disconnect();
    console.log(`About to exit with code: ${code}`);
  });
}

module.exports = startApp;
