import React, { useEffect } from "react";
import styles from "./ChatJoin.module.scss";

type Props = {
  onConnect: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null
  ) => void;
  onUsername: (event: React.FormEvent<HTMLInputElement>) => void;
  connectDisabled: boolean;
  error: string | null;
  username: string;
};

const ChatJoin = (props: Props): JSX.Element => {
  const inputRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (inputRef.current === event.target && event.key === "Enter") {
        !props.connectDisabled && props.onConnect(null);
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  });

  return (
    <div className={styles.root}>
      <div className={styles.root__card}>
        {props.error && (
          <div className={styles.root__card__error}>{props.error}</div>
        )}
        <div className={styles.root__form}>
          <input
            ref={inputRef}
            className={styles.root__form__field}
            placeholder="Type your name..."
            value={props.username}
            type="text"
            onChange={props.onUsername}
          />
          <button
            className={styles.root__form__button}
            disabled={props.connectDisabled}
            onClick={props.onConnect}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatJoin;
