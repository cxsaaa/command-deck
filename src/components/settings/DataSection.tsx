import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Sparkles, Trash2, RotateCcw, Eye, EyeOff, BookOpen } from "lucide-react";
import { toast } from "../common/Toast";
import { Button } from "../common/Button";
import { ConflictDialog } from "./ConflictDialog";
import { DeckBrowserModal } from "./DeckBrowserModal";
import * as platformRepository from "../../data/repositories/platformRepository";
import * as commandRepository from "../../data/repositories/commandRepository";
import { exportToJSON } from "../../domain/exportData";
import {
  parseImportJSON,
  analyzeImport,
  applyImport,
  type ImportAnalysis,
} from "../../domain/importData";
import { getAIPrompt } from "../../domain/aiPrompt";
import { queryKeys } from "../../state/queryKeys";
import type { CommandDeckExport, ConflictStrategy } from "../../domain/importSchema";

export function DataSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importData, setImportData] = useState<CommandDeckExport | null>(null);
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const [showDeckBrowser, setShowDeckBrowser] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"clearRecent" | "factoryReset" | null>(null);

  const { data: platforms } = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: platformRepository.listAllPlatforms,
  });

  async function handleExport() {
    try {
      await exportToJSON();
      toast(t("settings.exportSuccess"), "success");
    } catch {
      toast(t("settings.importError"), "error");
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseImportJSON(file);
      const analysis = await analyzeImport(data);
      setImportData(data);
      setImportAnalysis(analysis);

      if (analysis.conflicts.length > 0) {
        setShowConflict(true);
      } else {
        await doImport(data, "skip");
      }
    } catch (err) {
      toast(String(err), "error");
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function doImport(data: CommandDeckExport, strategy: ConflictStrategy) {
    try {
      const result = await applyImport(data, strategy);
      await queryClient.invalidateQueries();
      toast(
        t("settings.importSuccessDesc", {
          imported: result.imported,
          skipped: result.skipped,
        }),
        "success",
      );
    } catch {
      toast(t("settings.importError"), "error");
    }
    setImportData(null);
    setImportAnalysis(null);
    setShowConflict(false);
  }

  function handleCopyAiPrompt() {
    navigator.clipboard.writeText(getAIPrompt());
    toast(t("settings.aiPromptCopied"), "success");
  }

  async function handleToggleVisibility(id: string, currentlyVisible: boolean) {
    if (currentlyVisible) {
      await platformRepository.hidePlatform(id);
    } else {
      await platformRepository.showPlatform(id);
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
  }

  async function handleClearRecent() {
    await commandRepository.clearRecentHistory();
    await queryClient.invalidateQueries();
    toast(t("settings.clearRecentDone"), "success");
    setConfirmAction(null);
  }

  async function handleFactoryReset() {
    await commandRepository.factoryReset();
    await queryClient.invalidateQueries();
    toast(t("settings.factoryResetDone"), "success");
    setConfirmAction(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Platform visibility */}
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("settings.platformVisibility")}
        </label>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          {t("settings.platformVisibilityDesc")}
        </p>
        <div
          className="flex flex-col gap-1 rounded-lg p-2"
          style={{
            border: "1px solid var(--color-border)",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {platforms?.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-md"
              style={{ cursor: "pointer" }}
              onClick={() => handleToggleVisibility(platform.id, platform.isVisible)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: platform.color }}
                />
                <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                  {platform.name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {platform.commandCount} {t("contentHeader.commandsUnit")}
                </span>
              </div>
              {platform.isVisible ? (
                <Eye size={14} style={{ color: "var(--color-accent)" }} />
              ) : (
                <EyeOff size={14} style={{ color: "var(--color-text-placeholder)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Import / Export */}
      <div>
        <label
          className="text-sm font-medium block mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("settings.data")}
        </label>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            <span>{t("settings.importData")}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} />
            <span>{t("settings.exportData")}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowDeckBrowser(true)}>
            <BookOpen size={14} />
            <span>{t("settings.deckBrowser.button")}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyAiPrompt}>
            <Sparkles size={14} />
            <span>{t("settings.copyAiPrompt")}</span>
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Danger zone */}
      <div>
        <label
          className="text-sm font-medium block mb-1"
          style={{ color: "var(--color-state-danger)" }}
        >
          {t("settings.dangerZone")}
        </label>
        <div className="flex gap-2 flex-wrap mt-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmAction("clearRecent")}>
            <Trash2 size={14} />
            <span>{t("settings.clearRecent")}</span>
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmAction("factoryReset")}>
            <RotateCcw size={14} />
            <span>{t("settings.factoryReset")}</span>
          </Button>
        </div>
      </div>

      {/* Conflict dialog */}
      {showConflict && importData && importAnalysis && (
        <ConflictDialog
          analysis={importAnalysis}
          onResolve={(strategy) => doImport(importData, strategy)}
          onCancel={() => {
            setShowConflict(false);
            setImportData(null);
            setImportAnalysis(null);
          }}
        />
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60]"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-xl p-5 max-w-sm w-full"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <p className="text-sm mb-4" style={{ color: "var(--color-text-primary)" }}>
              {confirmAction === "clearRecent"
                ? t("settings.confirmClearRecent")
                : t("settings.confirmFactoryReset")}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmAction(null)}>
                {t("deleteConfirm.cancel")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmAction === "clearRecent" ? handleClearRecent : handleFactoryReset}
              >
                {t("deleteConfirm.confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Browser Modal */}
      <DeckBrowserModal open={showDeckBrowser} onClose={() => setShowDeckBrowser(false)} />
    </div>
  );
}
