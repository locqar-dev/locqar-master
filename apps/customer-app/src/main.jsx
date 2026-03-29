import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import { registerServiceWorker } from "./utils/sw-register";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register service worker for PWA support
if (import.meta.env.PROD) {
  registerServiceWorker();
}
