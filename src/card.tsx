import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CardPage from "./components/CardPage.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <CardPage />
    </ErrorBoundary>
  </StrictMode>,
);
