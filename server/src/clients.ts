import { Client } from "./models";

// ws clients store
export let clients: Client[] = [];

export const removeClient = (client: Client): void => {
  clients = clients.filter((cl) => cl.username !== client.username);
};

export const addClient = (client: Client): void => {
  clients.push(client);
};

export const destroyAll = (): void => {
  clients = [];
};
