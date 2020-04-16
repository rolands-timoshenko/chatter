import cors from "cors";
import express, { Request } from "express";
import expressWs from "express-ws";
import * as Websocket from "ws";
import { clients, removeClient, addClient, destroyAll } from "./clients";
import { eventLogger, requestLogger } from "./logger";
import {
  Client,
  ClientMessage,
  ConnectionCloseCodes,
  ServerMessages,
} from "./models";
import {
  NewClientValidationMiddleware,
  validateClientMessage,
} from "./validation";
import { createClientMessage, setClientInactivityListener } from "./helpers";

const clientInactivityTimeout = process.env.CLIENT_INACTIVITY_TIMEOUT
  ? Number(process.env.CLIENT_INACTIVITY_TIMEOUT)
  : 1000 * 30;

const serverPort = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT)
  : 5000;

const appBase = express();
const { app } = expressWs(appBase);
app.use(cors());

app.ws(
  "/chat/:username",
  NewClientValidationMiddleware,
  (ws: Websocket, req: Request) => {
    requestLogger.info({
      ip: req.ip,
      user: req.params.username,
      event: `OnSetup`,
    });

    const newClient: Client = ws;

    try {
      newClient.username = req.params.username;

      newClient.on("message", (msg: ClientMessage) => {
        requestLogger.info({
          ip: req.ip,
          user: newClient.username,
          event: `OnMessage`,
          msg,
        });

        // ensure client message is valid
        msg = validateClientMessage(msg);

        setClientInactivityListener(
          newClient,
          clientInactivityTimeout,
          "Disconnected due inactivity"
        );

        // Broadcast message to all connected clients
        clients.forEach((client) =>
          client.send(
            createClientMessage(
              ServerMessages.CLIENT_MSG,
              newClient.username,
              msg
            )
          )
        );
      });

      newClient.on("close", (code: number, reason?: string) => {
        // store message about why client being disconnected
        let clientMessage = "";

        switch (code) {
          case ConnectionCloseCodes.INACTIVITY:
            clientMessage = "Disconnected due inactivity";
            break;

          case ConnectionCloseCodes.CLIENT_DISCONNECT:
            clientMessage = "Left chat";
            break;

          default:
            clientMessage = "Disconnected";
        }

        requestLogger.info({
          ip: req.ip,
          event: "OnClose",
          user: `${newClient.username}`,
          msg: `${code} - ${reason || clientMessage}`,
        });

        // Remove disconnected client
        removeClient(newClient);

        // Broadcast message to all connected clients
        clients.forEach((client) =>
          client.send(
            createClientMessage(
              ServerMessages.CLIENT_DISCONNECT,
              newClient.username,
              clientMessage
            )
          )
        );
      });

      // Notify all clients about new client joined
      clients
        .filter((client) => client.username !== newClient.username)
        .forEach((client) =>
          client.send(
            createClientMessage(
              ServerMessages.CLIENT_CONNECTED,
              newClient.username
            )
          )
        );

      // Store new client
      addClient(newClient);

      // Notify client about successful join.
      newClient.send(
        createClientMessage(ServerMessages.CLIENT_READY, newClient.username)
      );

      setClientInactivityListener(
        newClient,
        clientInactivityTimeout,
        "Disconnected due inactivity"
      );
    } catch (err) {
      requestLogger.error({
        ip: req.ip,
        user: newClient.username,
        event: `OnSetup`,
        msg: err.message,
      });

      newClient.close(ConnectionCloseCodes.ERROR, err.message);
      removeClient(newClient);
    }
  }
);

const server = app.listen(serverPort, () => {
  eventLogger.info(`Server started at port ${serverPort}.`);
});

const shutdown = (): void => {
  eventLogger.info("Server shutdown.");
  clients.forEach((client) => {
    client.close(ConnectionCloseCodes.SERVER);
  });
  server.close((err: Error) => {
    if (err) {
      eventLogger.error(`Server shutdown failed with error: ${err.message}`);
      process.exit(1);
    } else {
      eventLogger.info("Server shutdown successfully.");
      process.exit(0);
    }
  });
};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

/*
  Some thoughts:
  
  Currently all communication is done over websocket connection. 
  But http connection could be used as well. For ex. could use it for handling {method:POST,  path:/register data:{username: "tester"}}
  would validate it using express-validator and response will return token="some generated token"
  which later could be used  ws://domain/:token for establish ws connection
  Also client messages could be sent over http post and validate as normal request data with middleware.
*/
