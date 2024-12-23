import { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "./hooks/use-websocket";
import { Header } from "./components/header";
import { CodeEditor } from "./components/code-editor";
import { Terminal } from "./components/terminal";

import node from "../../assets/icons/node.svg";
import python from "../../assets/icons/python.svg";
import go from "../../assets/icons/go.svg";

import { HistoryItem, Language } from "./types";

import "./editor-page.scss";
import { LANGUAGE_TO_DEFAULT_VALUE } from "./constants";
import { usePersist } from "./hooks/use-persist";

const options = [
  { value: "javascript", label: "Node", icon: node },
  { value: "python", label: "Python", icon: python },
  { value: "go", label: "Go", icon: go },
] satisfies { value: Language; label: string; icon: string }[];

const languageToServerLanguage = (language: Language) => {
  if (language === "javascript") return "node";
  return language;
};

export const EditorPage = () => {
  const persist = usePersist();
  const [language, setLanguage] = useState<Language>(() =>
    persist.get("language")
      ? (persist.get("language") as Language)
      : options[0].value,
  );
  const [history, setHistory] = useState<HistoryItem[]>([
    { logs: [], index: 0 },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const ws = useWebSocket({
    onOpen: () => { },
    onMessage: (message) => {
      if (message?.source === "stdout" || message?.source === "stderr") {
        setHistory((history) =>
          history.map((item) => {
            if (item.index === history.length - 1) {
              return {
                index: item.index,
                logs: [...item.logs, message.payload],
              } as HistoryItem;
            }

            return item;
          }),
        );

        terminalRef.current?.scroll({
          top: terminalRef.current?.scrollHeight,
          behavior: "instant",
        });
      }

      if (message?.source === "server") {
        if (message?.payload === "DONE") {
          setIsRunning(false);
          terminalRef.current?.scroll({
            top: terminalRef.current?.scrollHeight,
            behavior: "instant",
          });
          return;
        }

        if (message?.payload === "TERMINATED") {
          setHistory((runs) =>
            runs.map((run) => {
              if (run.index === runs.length - 1) {
                return {
                  index: run.index,
                  logs: [...run.logs, message?.payload],
                } as HistoryItem;
              }

              return run;
            }),
          );
          setIsRunning(false);
          terminalRef.current?.scroll({
            top: terminalRef.current?.scrollHeight,
            behavior: "instant",
          });
          return;
        }
      }
    },
    onClose: () => { },
  });

  const handleRunCode = () => {
    setHistory((history) => [...history, { logs: [], index: history.length }]);
    setIsRunning(true);
    const message = {
      name: "code:run",
      payload: {
        language: languageToServerLanguage(language),
        code: editorRef.current?.getValue() ?? "",
      },
    };
    ws.send(message);
  };

  const handleChangeLanguage = (option: (typeof options)[number]) => {
    if (option?.value) {
      setLanguage(option.value);

      persist.save("language", option.value);

      if (persist.get(option.value).length > 0) {
        editorRef.current?.setValue(persist.get(option.value));
      } else {
        editorRef.current?.setValue(LANGUAGE_TO_DEFAULT_VALUE[option.value]);
      }
    }
  };

  const handleStopCode = () => {
    const message = { name: "code:stop", payload: {} };
    ws.send(message);
  };

  const handleClickClearTerminal = () => {
    setHistory([{ logs: [], index: 0 }]);
  };

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    if (persist.get(language).length > 0) {
      editor.setValue(persist.get(language));
    }
  };

  const handleShiftEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      if (e.key === "Enter") {
        e.preventDefault();

        handleRunCode();
      }
    }
  };

  const handlePersistCode = () => {
    persist.save(language, editorRef.current?.getValue() ?? "");
  };

  useEffect(() => {
    document.addEventListener("keydown", handleShiftEnter);

    return () => {
      document.removeEventListener("keydown", handleShiftEnter);
    };
  }, [handleShiftEnter]);

  useEffect(() => {
    document.addEventListener("keydown", handlePersistCode);

    return () => {
      document.removeEventListener("keydown", handlePersistCode);
    };
  }, [handlePersistCode]);

  return (
    <div className="editor-page">
      <Header
        options={options}
        onChangeLanguage={handleChangeLanguage}
        language={language}
        onClickPlay={handleRunCode}
        onClickStop={handleStopCode}
        isDisabled={isRunning}
      />
      <div className="no-scroll-container">
        <CodeEditor onMount={handleEditorMount} language={language} />
        <Terminal
          ref={terminalRef}
          language={language}
          onClickClear={handleClickClearTerminal}
          history={history}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
};
