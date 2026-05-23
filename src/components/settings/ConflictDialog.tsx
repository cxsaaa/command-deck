import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";
import type { ConflictStrategy } from "../../domain/importSchema";
import type { ImportAnalysis } from "../../domain/importData";

interface ConflictDialogProps {
  analysis: ImportAnalysis;
  onResolve: (strategy: ConflictStrategy) => void;
  onCancel: () => void;
}

export function ConflictDialog({ analysis, onResolve, onCancel }: ConflictDialogProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60]"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="rounded-xl p-5 max-w-md w-full"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          {t("settings.importConflict")}
        </h3>
        <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
          {t("settings.importConflictDesc")}
        </p>

        <div
          className="rounded-lg p-3 mb-4 text-xs"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {analysis.conflicts.map((c, i) => (
            <div key={i}>
              {c.type === "platform" ? `Platform: ${c.name}` : `Command: ${c.name}`}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={() => onResolve("skip")}>
            {t("settings.conflictSkip")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onResolve("overwrite")}>
            {t("settings.conflictOverwrite")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => onResolve("rename")}>
            {t("settings.conflictRename")}
          </Button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-3 text-xs text-center cursor-pointer"
          style={{
            color: "var(--color-text-tertiary)",
            background: "none",
            border: "none",
          }}
        >
          {t("deleteConfirm.cancel")}
        </button>
      </div>
    </div>
  );
}
