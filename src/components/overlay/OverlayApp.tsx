import { useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { OverlaySearch } from "./OverlaySearch";

export function OverlayApp() {
  // Make body background transparent for overlay window
  useEffect(() => {
    document.body.style.backgroundColor = "transparent";
  }, []);

  useEffect(() => {
    const setupBlurHandler = async () => {
      const overlayWindow = getCurrentWebviewWindow();
      await overlayWindow.onFocusChanged(({ payload: focused }) => {
        if (!focused) {
          hideOverlay();
        }
      });
    };

    setupBlurHandler();
  }, []);

  return (
    <div className="overlay-root">
      <OverlaySearch />
    </div>
  );
}

async function hideOverlay() {
  try {
    console.log("[Overlay] Blur handler calling close_overlay_window");
    await invoke("close_overlay_window");
    console.log("[Overlay] Blur handler close done");
  } catch (err) {
    console.error("Failed to hide overlay:", err);
  }
}
