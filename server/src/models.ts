import * as Websocket from "ws";
import { TransformableInfo } from "logform";

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
  CLIENT_DISCONNECT = 4000,
  ERROR = 4001,
  INACTIVITY = 4002,
  SERVER = 4003,
}

export type CustomRequestLoggerMessage = {
  message:
    | {
        ip: string;
        user: string;
        event: string;
        msg?: string;
      }
    | string;
} & TransformableInfo;
