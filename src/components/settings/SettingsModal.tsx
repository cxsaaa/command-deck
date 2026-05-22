import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../common/Modal";
import { GeneralSection } from "./GeneralSection";
import { AppearanceSection } from "./AppearanceSection";
import { DataSection } from "./DataSection";
import { ShortcutsSection } from "./ShortcutsSection";
import { Monitor, Palette, Database, Keyboard } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
}

const navItems: NavItem[] = [
  { id: "general", icon: <Monitor size={16} />, labelKey: "settings.general" },
  { id: "appearance", icon: <Palette size={16} />, labelKey: "settings.appearance" },
  { id: "data", icon: <Database size={16} />, labelKey: "settings.data" },
  { id: "shortcuts", icon: <Keyboard size={16} />, labelKey: "settings.shortcuts" },
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("settings.title")}
      maxWidth="720px"
    >
      <div className="flex gap-6" style={{ height: "400px", overflow: "hidden" }}>
        {/* Left navigation */}
        <nav
          className="flex flex-col gap-1 shrink-0"
          style={{ width: "160px" }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer"
              style={{
                color: "var(--color-text-secondary)",
                background: "none",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onClick={() => {
                const el = document.getElementById(`settings-${item.id}`);
                if (el && contentRef.current) {
                  const container = contentRef.current;
                  const offsetTop = el.offsetTop - container.offsetTop;
                  container.scrollTo({ top: offsetTop, behavior: "smooth" });
                }
              }}
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div
          className="border-l shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        />

        {/* Right content */}
        <div ref={contentRef} className="flex-1 overflow-auto pr-1">
          <div id="settings-general" className="mb-8">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {t("settings.general")}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("settings.generalDesc")}
            </p>
            <GeneralSection />
          </div>

          <div
            className="border-t mb-8"
            style={{ borderColor: "var(--color-border)" }}
          />

          <div id="settings-appearance" className="mb-8">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {t("settings.appearance")}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("settings.appearanceDesc")}
            </p>
            <AppearanceSection />
          </div>

          <div
            className="border-t mb-8"
            style={{ borderColor: "var(--color-border)" }}
          />

          <div id="settings-data" className="mb-8">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {t("settings.data")}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("settings.dataDesc")}
            </p>
            <DataSection />
          </div>

          <div
            className="border-t mb-8"
            style={{ borderColor: "var(--color-border)" }}
          />

          <div id="settings-shortcuts">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {t("settings.shortcuts")}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {t("settings.shortcutsDesc")}
            </p>
            <ShortcutsSection />
          </div>
        </div>
      </div>
    </Modal>
  );
}
