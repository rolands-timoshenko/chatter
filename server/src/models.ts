import * as Websocket from "ws";

export type Client = {
  username?: string;
  timeoutId?: NodeJS.Timeout;
} & Websocket;

export enum ServerMessages {
  CLIENT_READY,
  CLIENT_MSG,
  CLIENT_DISCONNECT,
  CLIENT_CONNECTED,
}

export type ClientMessage = string;

export enum ConnectionCloseCodes {
  REGISTER = 4000,
  SETUP = 4001,
  INACTIVITY = 4002,
}
