import React, { FormEvent } from "react";
import ChatRoom from "./chatRoom/ChatRoom";
import ChatJoin from "./chatJoin/ChatJoin";
import styles from "./Chat.module.scss";

enum ServerMessages {
  CLIENT_READY,
  CLIENT_MSG,
  CLIENT_DISCONNECT,
  CLIENT_CONNECTED,
}

enum ServerConnectionCloseCode {
  NOT_RESPOND = 1006,
  CLIENT_DISCONNECTION = 4000,
  SERVER = 4003,
}

const wsApi = "ws://192.168.8.100:5000/chat/";

export type ClientMessage = {
  type?: ServerMessages;
  username: string;
  message: string;
  timestamp: string;
};

type Props = {};

type State = {
  username: string;
  error: null | string;
  connected: boolean;
  messages: ClientMessage[];
};

class Chat extends React.Component<Props, State> {
  socket: WebSocket | null = null;

  state = {
    username: "",
    error: null,
    connected: false,
    messages: [],
  };

  get isUsernameValid(): boolean {
    return /^[a-zaA-Z]{1,}[\d\w]{3,10}$/.test(this.state.username);
  }

  handleUsernameChange = (event: FormEvent<HTMLInputElement>): void => {
    this.setState({
      username: event.currentTarget.value.trim(),
    });
  };

  createConnection = (): void => {
    this.socket = new WebSocket(`${wsApi}${this.state.username}`);
    this.socket.addEventListener("open", this.handleSocketOpen);
    this.socket.addEventListener("message", this.handleSocketMessage);
    this.socket.addEventListener("close", this.handleSocketClose);
  };

  handleSocketMessage = (event: MessageEvent): void => {
    const clientMessage: ClientMessage = JSON.parse(event.data);
    switch (clientMessage.type) {
      case ServerMessages.CLIENT_READY:
        this.setState({
          connected: true,
          messages: [
            {
              ...clientMessage,
              message: "[Joined]",
            },
          ],
        });
        break;

      case ServerMessages.CLIENT_CONNECTED:
        this.setState((prevState) => ({
          messages: [
            ...prevState.messages,
            {
              ...clientMessage,
              message: "[Joined]",
            },
          ],
        }));
        break;

      case ServerMessages.CLIENT_DISCONNECT:
        this.setState((prevState) => ({
          messages: [
            ...prevState.messages,
            {
              ...clientMessage,
              message: `[${clientMessage.message}]`,
            },
          ],
        }));
        break;

      case ServerMessages.CLIENT_MSG:
        this.setState((prevState) => ({
          messages: [...prevState.messages, clientMessage],
        }));
        break;

      default:
        console.error(`Unsupported server message type: ${clientMessage.type}`);
    }
  };

  handleSocketOpen = (_event: Event): void => {
    //
  };

  handleSocketClose = (event: CloseEvent): void => {
    console.info(event);
    const { reason, code } = event;
    let error = null;

    switch (code) {
      case ServerConnectionCloseCode.NOT_RESPOND:
      case ServerConnectionCloseCode.SERVER:
        error = "Server is not responding";
        break;

      case ServerConnectionCloseCode.CLIENT_DISCONNECTION:
        error = `Good bye ${this.state.username}`;
        break;

      default:
        error = reason;
    }

    this.setState(
      {
        error: error,
        connected: false,
        messages: [],
        username: "",
      },
      () => {
        this.socket = null;
      }
    );
  };

  handleDisconnect = (): void => {
    this.socket &&
      this.socket.close(ServerConnectionCloseCode.CLIENT_DISCONNECTION);
  };

  handleMessageSubmit = (message: string): void => {
    this.socket && this.socket.send(message);
  };

  componentWillUnmount() {
    if (this.socket) {
      this.socket.removeEventListener("open", this.handleSocketOpen);
      this.socket.removeEventListener("message", this.handleSocketMessage);
      this.socket.removeEventListener("close", this.handleSocketClose);
      this.socket = null;
    }
  }

  render(): JSX.Element {
    return (
      <div className={styles.root}>
        {this.state.connected ? (
          <ChatRoom
            onDisconnect={this.handleDisconnect}
            onSubmitMessage={this.handleMessageSubmit}
            messages={this.state.messages}
          />
        ) : (
          <ChatJoin
            error={this.state.error}
            onConnect={this.createConnection}
            connectDisabled={!this.isUsernameValid}
            username={this.state.username}
            onUsername={this.handleUsernameChange}
          />
        )}
      </div>
    );
  }
}
export default Chat;
