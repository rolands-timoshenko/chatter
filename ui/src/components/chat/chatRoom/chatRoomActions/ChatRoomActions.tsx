import React, { useState, useEffect } from "react";
import styles from "./ChatRoomActions.module.scss";

type Props = {
  onDisconnect: () => void;
  onSubmitMessage: (message: string) => void;
};

const ChatRoomActions = (props: Props) => {
  const inputRef = React.createRef<HTMLTextAreaElement>();

  const [message, setMessage] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.currentTarget.value);
  };

  const handleSubmit = () => {
    if (message) {
      props.onSubmitMessage(message);
      setMessage("");
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (inputRef.current === event.target && event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  });

  return (
    <>
      <textarea
        ref={inputRef}
        className={styles.field}
        value={message}
        onChange={handleChange}
      ></textarea>
      <div className={styles.buttons}>
        <button disabled={!message} onClick={handleSubmit}>
          Send
        </button>
        <button onClick={props.onDisconnect}>Disconnect</button>
      </div>
    </>
  );
};
export default ChatRoomActions;
