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

export type ClientMessage = {
  type: ServerMessages;
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
    this.socket = new WebSocket(
      `ws://localhost:5000/chat/${this.state.username}`
    );
    this.socket.addEventListener("open", this.handleSocketOpen);
    this.socket.addEventListener("message", this.handleSocketMessage);
    this.socket.addEventListener("close", this.handleSocketClose);
  };

  handleSocketMessage = (event: MessageEvent): void => {
    console.info("handleSocketMessage: ", event);
    const clientMessage: ClientMessage = JSON.parse(event.data);
    switch (clientMessage.type) {
      case ServerMessages.CLIENT_READY:
        this.setState({
          connected: true,
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
      case ServerMessages.CLIENT_MSG:
        this.setState((prevState) => ({
          messages: [...prevState.messages, clientMessage],
        }));
        break;

      default:
      // Log
    }
  };

  handleSocketOpen = (event: Event): void => {
    console.info("handleSocketOpen: ", event);
  };

  handleSocketClose = (event: CloseEvent): void => {
    const { reason, code } = event;
    console.info(code, reason);
    // 1006 when server is not responding
    // 3000 when client disconnects him self
    this.setState(
      {
        error: reason,
        connected: false,
        messages: [],
      },
      () => {
        this.socket = null;
        console.info(event);
      }
    );
  };

  handleDisconnect = (): void => {
    this.socket && this.socket.close(3000);
  };

  handleMessageSubmit = (message: string) => {
    this.socket && this.socket.send(message);
  };

  componentWillUnmount() {
    this.socket = null;
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
