process.title = "package-api";

// Import dependencies
import express from "express";
import { logger } from "./logging";
import { packageRouter } from "./route/package.route";
import { authRouter } from "./route/authenticate.route";
import { packagesRouter } from "./route/packages.route";
import { resetRouter } from "./route/reset.route";
import { userRouter } from "./route/user.route";
import { connectToMongo, disconnectFromMongo } from "./config/config";

// define app
const app = express();

function defineServer() {

  logger.info("Starting up the API server...");

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Define placeholder endpoint for root route
  app.get("/", (req, res, next) => {
    res.send("respond with a resource");
  });

  app.use("/package", packageRouter);
  app.use("/authenticate", authRouter);
  app.use("/packages", packagesRouter);
  app.use("/reset", resetRouter);
  app.use("/user", userRouter);

}

function startServer() {
  // Connect to database
  connectToMongo();

  const port: Number = Number(process.env.PORT || 3000);

  app.listen(port, () => {
    logger.info("API server listening on port 3000");
  });

  // disconnectFromMongo();
}

function main() {

  // Define and start the server
  defineServer();
  startServer();
}

main();
