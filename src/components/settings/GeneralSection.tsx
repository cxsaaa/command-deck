import { useCallback } from "react";
import { useTranslation } from "react-i18next";
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

  return (
    <div className="flex flex-col gap-5">
      {/* Language */}
      <SettingRow label={t("settings.language")}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="text-sm outline-none"
          style={{
            height: "36px",
            padding: "0 10px",
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
      <p
        className="text-xs -mt-3"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("settings.autostartDesc")}
      </p>

      {/* Window behavior */}
      <div
        className="border-t pt-5"
        style={{ borderColor: "var(--color-border)" }}
      >
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

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer"
      style={{
        backgroundColor: checked
          ? "var(--color-accent)"
          : "var(--color-border)",
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
