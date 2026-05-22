import { useTranslation } from "react-i18next";

interface ShortcutItem {
  keys: string[];
  labelKey: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ["⌘", "K"], labelKey: "shortcuts.focusSearch" },
  { keys: ["↑", "↓"], labelKey: "shortcuts.navigateResults" },
  { keys: ["Enter"], labelKey: "shortcuts.copySelected" },
  { keys: ["Esc"], labelKey: "shortcuts.closeOrClear" },
];

export function ShortcutsSection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      {shortcuts.map((item) => (
        <div
          key={item.labelKey}
          className="flex items-center justify-between"
        >
          <span
            className="text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            {t(item.labelKey)}
          </span>
          <div className="flex items-center gap-1">
            {item.keys.map((key, i) => (
              <span key={i}>
                <kbd
                  className="inline-flex items-center justify-center text-xs font-medium rounded"
                  style={{
                    minWidth: "24px",
                    height: "24px",
                    padding: "0 6px",
                    backgroundColor: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                    boxShadow: "0 1px 0 var(--color-border)",
                  }}
                >
                  {key}
                </kbd>
                {i < item.keys.length - 1 && (
                  <span
                    className="text-xs mx-0.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    +
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
