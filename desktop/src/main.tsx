import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { DemoStateProvider } from "./demo/DemoStateStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <DemoStateProvider>
        <App />
      </DemoStateProvider>
    </AppProvider>
  </React.StrictMode>,
);
