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
import { readFileSync } from "fs";
import { createServer } from "https";
import { join } from "path";
import { homedir } from "os";

var cors = require("cors");
// define app

function defineServer() {
  const app = express();

  logger.info("Starting up the API server...");

  app.use(express.json({ limit: "50mb" }));
  app.use(cors());
  app.use(express.urlencoded({ extended: false }));

  // Define placeholder endpoint for root route
  app.get("/", (req, res, next) => {
    logger.info("health check: server is up!")
    res.send("respond with a resource");
  });

  app.use("/package", packageRouter);
  app.use("/authenticate", authRouter);
  app.use("/packages", packagesRouter);
  app.use("/reset", resetRouter);
  app.use("/user", userRouter);

  return app;
}

function startServer(app) {
  const port: Number = Number(process.env.PORT || 3000);
  let server;
  const httpsOptions = {
		key: readFileSync (join(homedir(), ".certs/ca.key")),
		cert: readFileSync (join(homedir(), ".certs/ca.crt"))
	};

  server = createServer(httpsOptions, app);

  server.listen(port, () => {
    logger.info("API server listening on port " + port);
  });
}

function main() {
  // Connect to database
  connectToMongo();

  // Define and start the server
  let app = defineServer();
  startServer(app);
}

// Run main conditionally if it is not a module import
if (require.main === module) {
  main();
}

export const exportedForTestingApp = {
  defineServer,
  startServer,
};
