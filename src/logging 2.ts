import winston from "winston";

// Create logger that writes to log.log file
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ 
            filename: "log.log",
            options: { flags: "w" },
        }),
    ],
});