import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { EditorPage } from "./features/editor/editor-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
