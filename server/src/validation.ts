import * as Websocket from "ws";
import { NextFunction, Request } from "express";
import { requestLogger } from "./logger";
import { clients } from "./clients";
import { ConnectionCloseCodes, ClientMessage } from "./models";
/* tslint:disable-next-line */
const xss = require("xss");

export const NewClientValidationMiddleware = (
  ws: Websocket,
  req: Request,
  next: NextFunction
) => {
  const username = req.params.username;
  requestLogger.info({
    ip: req.ip,
    event: "OnUsernameValidation",
    user: username,
  });
  try {
    if (!username) throw new Error("Please provide username");
    // Same patter has ui
    if (!/^[a-zA-Z]{1,}[\d\w]{3,10}$/.test(username))
      throw new Error("Please provide valid username.");
    if (clients.find((client) => client.username === username))
      throw new Error("Username already taken");
    next();
  } catch (err) {
    requestLogger.error({
      ip: req.ip,
      event: "OnUsernameValidation",
      user: username,
      msg: err.message,
    });
    ws.close(ConnectionCloseCodes.ERROR, err.message);
  }
};

export const validateClientMessage = (msg: ClientMessage): ClientMessage => {
  // Custom validation could be placed here
  return xss(msg, {
    whiteList: [], // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whilelist
    // stripIgnoreTagBody: ["script"], // the script tag is a special case, we need
  });
};
