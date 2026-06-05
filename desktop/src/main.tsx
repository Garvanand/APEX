import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DemoStateProvider } from "./demo/DemoStateStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <DemoStateProvider>
          <App />
        </DemoStateProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
