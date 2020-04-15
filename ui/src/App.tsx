import React from "react";
import Chat from "./components/chat/Chat";
import styles from "./App.module.scss";

const App = () => {
  return (
    <div className={styles.root}>
      <Chat />
    </div>
  );
};

export default App;
