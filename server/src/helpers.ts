import { ServerMessages, Client, ConnectionCloseCodes } from "./models";

export const createClientMessage = (
  type: ServerMessages,
  username: string,
  message?: string
): string =>
  JSON.stringify({
    type,
    username,
    message,
    timestamp: Date.now(),
  });

export const setClientInactivityListener = (
  client: Client,
  clientInactivityTimeout: number,
  msg: string
): void => {
  // On every client message inactivity timeout being reset
  if (client.timeoutId) {
    clearTimeout(client.timeoutId);
  }

  // Set inactivity timeout
  client.timeoutId = setTimeout(() => {
    client.close(ConnectionCloseCodes.INACTIVITY, msg);
  }, clientInactivityTimeout);
};
