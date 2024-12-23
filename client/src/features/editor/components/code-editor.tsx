import { editor } from "monaco-editor";

import { Editor, Monaco } from "@monaco-editor/react";

import "./code-editor.scss";
import { LANGUAGE_TO_DEFAULT_VALUE } from "../constants";
import { Language } from "../types";

const DEFAULT_LANGUAGE: Language = "javascript";

type Props = {
  language: Language;
  onMount: (editor: editor.IStandaloneCodeEditor, _: Monaco) => void;
};

export const CodeEditor: React.FC<Props> = (props) => {
  return (
    <div className="code-editor-container">
      <Editor
        onMount={props.onMount}
        theme="vs-dark"
        language={props.language}
        defaultLanguage={
          props.language.length > 0 ? props.language : DEFAULT_LANGUAGE
        }
        defaultValue={LANGUAGE_TO_DEFAULT_VALUE[props.language]}
      />
    </div>
  );
};
