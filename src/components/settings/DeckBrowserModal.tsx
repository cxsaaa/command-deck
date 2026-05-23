import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Check, Loader2 } from "lucide-react";
import { Modal } from "../common/Modal";
import {
  useDeckManifest,
  fetchDeckData,
  saveInstalledDeck,
  isDeckInstalled,
} from "../../domain/deckService";
import { importDeck } from "../../data/repositories/commandRepository";
import { queryKeys } from "../../state/queryKeys";
import { toast } from "../common/Toast";
import type { DeckMeta } from "../../domain/deckService";

interface DeckBrowserModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeckBrowserModal({ open, onClose }: DeckBrowserModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: manifest, isLoading, error } = useDeckManifest();
  const [importingDeckId, setImportingDeckId] = useState<string | null>(null);

  const handleImport = async (deck: DeckMeta) => {
    setImportingDeckId(deck.id);

    try {
      const deckData = await fetchDeckData(deck.file);
      const result = await importDeck(deckData);

      // Save to installed decks cache
      saveInstalledDeck({
        id: deck.id,
        version: deck.version,
        installedAt: new Date().toISOString(),
        importedCount: result.imported,
      });

      // Invalidate commands query to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.commands({}) });

      toast(
        t("settings.deckBrowser.importSuccess", {
          imported: result.imported,
          skipped: result.skipped,
        }),
        "success",
      );
    } catch (err) {
      console.error("Failed to import deck:", err);
      toast(t("settings.deckBrowser.networkError"), "error");
    } finally {
      setImportingDeckId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("settings.deckBrowser.title")}>
      <div className="flex flex-col gap-4" style={{ minHeight: "300px" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--color-text-tertiary)" }}
            />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>
              {t("settings.deckBrowser.networkError")}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {String(error)}
            </p>
          </div>
        ) : manifest && manifest.decks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {manifest.decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onImport={() => handleImport(deck)}
                isImporting={importingDeckId === deck.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              {t("settings.deckBrowser.noDecks")}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DeckCard({
  deck,
  onImport,
  isImporting,
}: {
  deck: DeckMeta;
  onImport: () => void;
  isImporting: boolean;
}) {
  const { t } = useTranslation();
  const installed = isDeckInstalled(deck.id, deck.version);

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded-lg"
      style={{
        backgroundColor: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {deck.name}
          </h3>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
            {deck.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onImport}
          disabled={isImporting || installed}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0"
          style={{
            backgroundColor: installed ? "var(--color-state-success-soft)" : "var(--color-accent)",
            color: installed ? "var(--color-state-success)" : "var(--color-text-inverse)",
            border: "none",
            cursor: installed ? "default" : "pointer",
            opacity: isImporting ? 0.7 : 1,
          }}
        >
          {isImporting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : installed ? (
            <Check size={12} />
          ) : (
            <Download size={12} />
          )}
          {installed
            ? t("settings.deckBrowser.installed")
            : isImporting
              ? t("settings.deckBrowser.importing")
              : t("settings.deckBrowser.import")}
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: "var(--color-bg-hover)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {t("settings.deckBrowser.commands", { count: deck.commandCount })}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {deck.author}
        </span>
        {deck.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
