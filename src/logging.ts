import winston from "winston";
import path from "path";
import fs from "fs";

let logFolder = path.join(__dirname, "..", "logs");
let logFile = path.join(__dirname, "..", "log.log");
if (fs.existsSync(logFile)) {
  let shouldDelete = fs.readFileSync(logFile, "utf8").split("\n").length > 7;

  if (shouldDelete) {
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder);
    }

    // Move log file to directory with timestamp
    const timestamp = new Date().toLocaleString('en-US', { timeZone: "America/New_York" }).replace(/\//g, "-").replace(" ", "");
    fs.renameSync(
      logFile,
      path.join(logFolder, `${timestamp}.log`)
    );
  }
}

// Create logger that writes to log.log file
export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.colorize()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "..", "log.log"),
      options: { flags: "w" },
    }),
  ],
});
