import React from "react";
import ReactDOM from "react-dom/client";
import i18n from "./i18n";
import App from "./App";
import { OverlayApp } from "./components/overlay/OverlayApp";
import { PopoverSearch } from "./components/overlay/PopoverSearch";
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

  // 根据窗口标签渲染不同的内容
  const windowLabel = await getCurrentWindowLabel();

  let AppComponent = App;
  if (windowLabel === "overlay") {
    AppComponent = OverlayApp;
  } else if (windowLabel === "popover") {
    AppComponent = PopoverSearch;
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Providers>
        <ToastProvider>
          <AppComponent />
        </ToastProvider>
      </Providers>
    </React.StrictMode>,
  );
}

async function getCurrentWindowLabel(): Promise<string> {
  try {
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const window = getCurrentWebviewWindow();
    return window.label;
  } catch {
    return "main";
  }
}

bootstrap();
