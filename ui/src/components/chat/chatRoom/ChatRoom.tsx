import React, { useState } from "react";
import { ClientMessage } from "../Chat";
import styles from "./ChatRoom.module.scss";
import moment from "moment";

type Props = {
  onDisconnect: () => void;
  messages: ClientMessage[];
  onSubmitMessage: (message: string) => void;
};

const ChatRoom = (props: Props): JSX.Element => {
  console.info(props.messages);

  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(event.currentTarget.value);

  const handleSubmit = () => {
    message && props.onSubmitMessage(message);
  };

  return (
    <div className={styles.root}>
      <div className={styles.root__content}>
        <ul>
          {props.messages.map((message, index) => (
            <li key={index}>
              <span>
                [{moment(message.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
                ]&nbsp;&nbsp;
              </span>
              <strong>{message.username}:&nbsp;</strong>
              <span>{message.message}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.root__form}>
        <textarea
          className={styles.root__form__field}
          onChange={handleChange}
        ></textarea>
        <button onClick={handleSubmit}>Send</button>
        <button onClick={props.onDisconnect}>Disconnect</button>
      </div>
    </div>
  );
};
export default ChatRoom;
