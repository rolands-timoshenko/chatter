import winston, { createLogger, transports, format } from "winston";
import { CustomRequestLoggerMessage } from "./models";

export type Logger = winston.Logger;

export const requestLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.printf(
      ({ timestamp, level, message }: CustomRequestLoggerMessage) => {
        if (typeof message !== "string") {
          const { ip, user, event, msg } = message;
          message = `[ip:${ip}] [user:${user}] [event:${event}]`;
          if (msg) {
            message += ` [msg: ${msg}]`;
          }
        }
        return `${timestamp} [${level}]: ${message}`;
      }
    )
  ),
  transports: [
    new transports.File({
      filename: "./logs/request-logs.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ],
});

export const eventLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.File({
      filename: "./logs/event-logs.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ],
});
