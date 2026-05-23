import { useTranslation } from "react-i18next";
import { useUiStore, type ThemeMode, type DensityMode } from "../../state/uiStore";
import { Sun, Moon, Monitor as MonitorIcon } from "lucide-react";

export function AppearanceSection() {
  const { t } = useTranslation();
  const themeMode = useUiStore((s) => s.themeMode);
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const densityMode = useUiStore((s) => s.densityMode);
  const toggleDensityMode = useUiStore((s) => s.toggleDensityMode);

  const themeOptions: { mode: ThemeMode; icon: React.ReactNode; labelKey: string }[] = [
    { mode: "system", icon: <MonitorIcon size={20} />, labelKey: "settings.themeSystem" },
    { mode: "light", icon: <Sun size={20} />, labelKey: "settings.themeLight" },
    { mode: "dark", icon: <Moon size={20} />, labelKey: "settings.themeDark" },
  ];

  const densityOptions: { mode: DensityMode; labelKey: string }[] = [
    { mode: "comfortable", labelKey: "settings.densityComfortable" },
    { mode: "compact", labelKey: "settings.densityCompact" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Theme mode */}
      <div>
        <label
          className="text-sm font-medium block mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("settings.themeMode")}
        </label>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setThemeMode(opt.mode)}
              className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer"
              style={{
                flex: 1,
                border:
                  themeMode === opt.mode
                    ? "2px solid var(--color-accent)"
                    : "1px solid var(--color-border)",
                backgroundColor:
                  themeMode === opt.mode ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                color:
                  themeMode === opt.mode ? "var(--color-accent)" : "var(--color-text-secondary)",
              }}
            >
              {opt.icon}
              <span>{t(opt.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density mode */}
      <div>
        <label
          className="text-sm font-medium block mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("settings.density")}
        </label>
        <div className="flex gap-2">
          {densityOptions.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                if (densityMode !== opt.mode) toggleDensityMode();
              }}
              className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              style={{
                flex: 1,
                border:
                  densityMode === opt.mode
                    ? "2px solid var(--color-accent)"
                    : "1px solid var(--color-border)",
                backgroundColor:
                  densityMode === opt.mode ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                color:
                  densityMode === opt.mode ? "var(--color-accent)" : "var(--color-text-secondary)",
              }}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
