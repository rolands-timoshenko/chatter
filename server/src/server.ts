import cors from "cors";
import express, { Request } from "express";
import expressWs from "express-ws";
import * as Websocket from "ws";
import { clients, removeClient, addClient } from "./clients";
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
  : 10000;

const serverPort = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT)
  : 5000;

const appBase = express();
const { app } = expressWs(appBase);
app.use(cors());

app.ws(
  "/chat/:username",
  // Validate new client connection
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
          message: msg,
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
        requestLogger.info({
          ip: req.ip,
          event: "OnClose",
          user: `${newClient.username}`,
          message: `Code: ${code}, Reason: ${reason}`,
        });
        // Notify all connected clients about client being discoinnected
        clients
          .filter((client) => client.username !== newClient.username)
          .forEach((client) =>
            client.send(
              createClientMessage(
                ServerMessages.CLIENT_DISCONNECT,
                newClient.username,
                reason && `[${reason}]`
              )
            )
          );

        // Remove disconnected client
        removeClient(newClient);
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
        message: err.message,
      });
      newClient.close(ConnectionCloseCodes.SETUP, err.message);
      removeClient(newClient);
    }
  }
);

const server = app.listen(serverPort, () => {
  eventLogger.info(`Server started at port ${serverPort}.`);
});

const shutdown = (): void => {
  eventLogger.info("Server shutdown.");
  // All clients will be notified by close code 1006
  server.close((err: Error): void => {
    setTimeout(() => process.exit(0));
    if (err) {
      eventLogger.error(`Server shutdown failed with error: ${err.message}`);
    } else {
      eventLogger.info("Server shutdown success.");
    }
  });
};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
