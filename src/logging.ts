import winston from "winston";
import path from "path";

// Create logger that writes to log.log file
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ 
            filename: path.join(__dirname, "..", "log.log"),
            options: { flags: "w" },
        }),
    ],
});