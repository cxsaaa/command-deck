import React from "react";
import ReactDOM from "react-dom/client";
import i18n from "./i18n";
import App from "./App";
import { Providers } from "./app/providers";
import { ToastProvider } from "./components/common";
import { initDatabase } from "./data/db";
import "./styles/tokens.css";
import "./index.css";

async function bootstrap() {
  try {
    await initDatabase();
  } catch (err) {
    document.getElementById("root")!.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#F5F5F7;font-family:system-ui;">
        <div style="text-align:center;color:#DC2626;">
          <p style="font-size:18px;font-weight:600;margin-bottom:8px;">${i18n.t("app.dbInitFailed")}</p>
          <p style="font-size:14px;color:#475467;">${String(err)}</p>
        </div>
      </div>`;
    return;
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Providers>
        <ToastProvider>
          <App />
        </ToastProvider>
      </Providers>
    </React.StrictMode>,
  );
}

bootstrap();
