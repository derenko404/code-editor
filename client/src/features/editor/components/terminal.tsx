import { forwardRef, Fragment } from "react";

import clear from "../../../assets/icons/clear.svg";

import { HistoryItem } from "../types";

import "./terminal.scss";

const languageToFilename = (language: string) => {
  switch (language) {
    case "javascript":
      return "index.js";
    case "python":
      return "main.js";
    case "go":
      return "main.go";
    default:
      return "";
  }
};

type Props = {
  onClickClear: () => void;
  history: HistoryItem[];
  language: string;
  isRunning: boolean;
};

export const Terminal = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return (
    <div className="terminal-container" ref={ref}>
      <div className="terminal-container-controls">
        <button onClick={props.onClickClear} disabled={props.isRunning}>
          <img src={clear} alt="clear" />
        </button>
      </div>
      {props.history.map((item) => (
        <Fragment key={item.index}>
          <p className="terminal-container-input">
            anonymous@cloud (readonly) %{" "}
            {props.isRunning && item.index === props.history.length - 1
              ? `Running ${languageToFilename(props.language)}...`
              : ""}
          </p>
          <div className="terminal-container-logs">
            {item.logs.map((log, i) => (
              <p key={`${log.slice(0, 8)}-${i}`}>{log}</p>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
