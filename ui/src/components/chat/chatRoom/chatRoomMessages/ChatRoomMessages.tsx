import React, { useEffect } from "react";
import { ClientMessage } from "../../Chat";
import moment from "moment";
import styles from "./ChatRoomMessages.module.scss";

type Props = {
  messages: ClientMessage[];
  onMessagesRendered?: () => void;
};

const ChatRoomMessages = (props: Props): JSX.Element => {
  useEffect(() => {
    props.onMessagesRendered && props.onMessagesRendered();
  });

  return (
    <ul className={styles.root}>
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
  );
};
export default ChatRoomMessages;
