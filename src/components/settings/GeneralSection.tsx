import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { useUiStore, type Locale } from "../../state/uiStore";

export function GeneralSection() {
  const { t } = useTranslation();
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);
  const hideOnBlur = useUiStore((s) => s.hideOnBlur);
  const setHideOnBlur = useUiStore((s) => s.setHideOnBlur);
  const dockToggle = useUiStore((s) => s.dockToggle);
  const setDockToggle = useUiStore((s) => s.setDockToggle);
  const autostartEnabled = useUiStore((s) => s.autostartEnabled);
  const setAutostartEnabled = useUiStore((s) => s.setAutostartEnabled);
  const trayMode = useUiStore((s) => s.trayMode);
  const setTrayMode = useUiStore((s) => s.setTrayMode);
  const globalHotkey = useUiStore((s) => s.globalHotkey);
  const setGlobalHotkey = useUiStore((s) => s.setGlobalHotkey);
  const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);

  // 注册默认全局快捷键
  useEffect(() => {
    const registerDefaultHotkey = async () => {
      try {
        await invoke("register_global_shortcut", { shortcut: globalHotkey });
      } catch (err) {
        console.error("Failed to register default hotkey:", err);
      }
    };
    registerDefaultHotkey();
  }, []);

  const handleAutostartToggle = useCallback(async () => {
    const next = !autostartEnabled;
    setAutostartEnabled(next);
    try {
      const { enable, disable } = await import("@tauri-apps/plugin-autostart");
      if (next) {
        await enable();
      } else {
        await disable();
      }
    } catch {
      // Not in Tauri environment
    }
  }, [autostartEnabled, setAutostartEnabled]);

  const handleTrayModeToggle = useCallback(async () => {
    const next = !trayMode;
    setTrayMode(next);
    try {
      await invoke("set_dock_visible", { visible: !next });
    } catch {
      // Not in Tauri environment
    }
  }, [trayMode, setTrayMode]);

  const handleHotkeyRecord = useCallback(() => {
    setIsRecordingHotkey(true);
  }, []);

  const handleHotkeyKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isRecordingHotkey) return;

      e.preventDefault();
      e.stopPropagation();

      const modifiers: string[] = [];
      if (e.metaKey) modifiers.push("Meta");
      if (e.ctrlKey) modifiers.push("Ctrl");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");

      // 忽略单独的修饰键
      if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const hotkey = [...modifiers, key].join("+");

      setGlobalHotkey(hotkey);
      setIsRecordingHotkey(false);

      // 注册新的全局快捷键
      try {
        invoke("register_global_shortcut", { shortcut: hotkey });
      } catch {
        // Not in Tauri environment
      }
    },
    [isRecordingHotkey, setGlobalHotkey],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Language */}
      <SettingRow label={t("settings.language")}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="text-sm outline-none"
          style={{
            height: "30px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
            minWidth: "160px",
          }}
        >
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
        </select>
      </SettingRow>

      {/* Autostart */}
      <SettingRow label={t("settings.autostart")}>
        <Toggle checked={autostartEnabled} onChange={handleAutostartToggle} />
      </SettingRow>
      <p className="text-xs -mt-3" style={{ color: "var(--color-text-tertiary)" }}>
        {t("settings.autostartDesc")}
      </p>

      {/* Tray Mode */}
      <SettingRow label={t("settings.trayMode")}>
        <Toggle checked={trayMode} onChange={handleTrayModeToggle} />
      </SettingRow>
      <p className="text-xs -mt-3" style={{ color: "var(--color-text-tertiary)" }}>
        {t("settings.trayModeDesc")}
      </p>

      {/* Global Hotkey */}
      <SettingRow label={t("settings.globalHotkey")}>
        <button
          type="button"
          onClick={handleHotkeyRecord}
          onKeyDown={handleHotkeyKeyDown}
          onBlur={() => setIsRecordingHotkey(false)}
          className="text-sm outline-none cursor-pointer"
          style={{
            height: "30px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: isRecordingHotkey
              ? "var(--color-accent-soft)"
              : "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
            minWidth: "160px",
            textAlign: "center",
          }}
        >
          {isRecordingHotkey ? t("settings.globalHotkeyPlaceholder") : globalHotkey}
        </button>
      </SettingRow>
      <p className="text-xs -mt-3" style={{ color: "var(--color-text-tertiary)" }}>
        {t("settings.globalHotkeyDesc")}
      </p>

      {/* Window behavior */}
      <div className="border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
        <span
          className="text-sm font-medium block mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("settings.windowBehavior")}
        </span>
      </div>

      <SettingRow label={t("settings.hideOnBlur")}>
        <Toggle checked={hideOnBlur} onChange={() => setHideOnBlur(!hideOnBlur)} />
      </SettingRow>

      <SettingRow label={t("settings.dockToggle")}>
        <Toggle checked={dockToggle} onChange={() => setDockToggle(!dockToggle)} />
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer"
      style={{
        backgroundColor: checked ? "var(--color-accent)" : "var(--color-border)",
        border: "none",
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full transition-transform"
        style={{
          backgroundColor: "white",
          transform: checked ? "translateX(18px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}
