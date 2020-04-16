import React from "react";
import { ClientMessage } from "../Chat";
import styles from "./ChatRoom.module.scss";
import ChatRoomActions from "./chatRoomActions/ChatRoomActions";
import ChatRoomMessages from "./chatRoomMessages/ChatRoomMessages";

type Props = {
  onDisconnect: () => void;
  messages: ClientMessage[];
  onSubmitMessage: (message: string) => void;
};

const ChatRoom = (props: Props): JSX.Element => {
  const contentRef = React.createRef<HTMLDivElement>();

  const handleMessagesRendered = () => {
    contentRef.current &&
      contentRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.root}>
      <div className={styles.root__content}>
        <ChatRoomMessages
          messages={props.messages}
          onMessagesRendered={handleMessagesRendered}
        />
        <div style={{ float: "left", clear: "both" }} ref={contentRef}></div>
      </div>
      <div className={styles.root__actions}>
        <ChatRoomActions
          onDisconnect={props.onDisconnect}
          onSubmitMessage={props.onSubmitMessage}
        />
      </div>
    </div>
  );
};
export default ChatRoom;
