import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { OverlayResultList } from "./OverlayResultList";
import { OverlayPlaceholderFloat } from "./OverlayPlaceholderFloat";
import { searchCommands } from "../../domain/search";
import { queryKeys } from "../../state/queryKeys";
import { useCommands } from "../../data/repositories/commandRepository";
import type { Command } from "../../domain/types";

export function OverlaySearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: commands = [] } = useCommands();

  const { data: results = [] } = useQuery({
    queryKey: queryKeys.overlaySearch(query),
    queryFn: () => searchCommands(commands, query, { navType: "all" }),
    enabled: query.length > 0 && commands.length > 0,
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleCopy(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        hideOverlay();
        break;
    }
  };

  const handleCopy = async (command: Command) => {
    try {
      // 检查是否有占位符
      const hasPlaceholders = /(<[^>]+>|\[[^\]]+\]|\{\{[^}]+\}\})/.test(command.command);

      if (hasPlaceholders) {
        // 有占位符，显示变量填写浮层
        setSelectedCommand(command);
      } else {
        // 无占位符，直接复制
        await navigator.clipboard.writeText(command.command);
        console.log("[Overlay] Copy done, calling close_overlay_window");
        await invoke("close_overlay_window");
        console.log("[Overlay] close_overlay_window done");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePlaceholderComplete = async (replacedCommand: string) => {
    try {
      await navigator.clipboard.writeText(replacedCommand);
      setSelectedCommand(null);
      await invoke("close_overlay_window");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePlaceholderCancel = () => {
    setSelectedCommand(null);
  };

  return (
    <div className="overlay-container">
      <div className="overlay-search-box">
        <Search size={16} style={{ color: "var(--color-text-placeholder)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          autoFocus
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="overlay-search-input"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="overlay-clear-button"
          >
            ×
          </button>
        )}
      </div>

      {selectedCommand ? (
        <OverlayPlaceholderFloat
          command={selectedCommand}
          onComplete={handlePlaceholderComplete}
          onCancel={handlePlaceholderCancel}
        />
      ) : (
        results.length > 0 && (
          <OverlayResultList
            results={results}
            selectedIndex={selectedIndex}
            query={query}
            onSelect={handleCopy}
          />
        )
      )}
    </div>
  );
}

async function hideOverlay() {
  try {
    await invoke("hide_overlay_window");
  } catch (err) {
    console.error("Failed to hide overlay:", err);
  }
}
