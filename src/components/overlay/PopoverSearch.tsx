import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, Pin, PinOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { OverlayResultList } from "./OverlayResultList";
import { OverlayPlaceholderFloat } from "./OverlayPlaceholderFloat";
import { searchCommands } from "../../domain/search";
import { queryKeys } from "../../state/queryKeys";
import { useCommands } from "../../data/repositories/commandRepository";
import type { Command } from "../../domain/types";

export function PopoverSearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [pinned, setPinned] = useState(false);
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

  // 失焦隐藏（除非已固定）
  useEffect(() => {
    const setupBlurHandler = async () => {
      const popoverWindow = getCurrentWebviewWindow();
      await popoverWindow.onFocusChanged(({ payload: focused }) => {
        if (!focused && !pinned) {
          hidePopover();
        }
      });
    };

    setupBlurHandler();
  }, [pinned]);

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
        hidePopover();
        break;
    }
  };

  const handleCopy = async (command: Command) => {
    try {
      const hasPlaceholders = /(<[^>]+>|\[[^\]]+\]|\{\{[^}]+\}\})/.test(command.command);

      if (hasPlaceholders) {
        setSelectedCommand(command);
      } else {
        await navigator.clipboard.writeText(command.command);
        await invoke("hide_popover_window");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePlaceholderComplete = async (replacedCommand: string) => {
    try {
      await navigator.clipboard.writeText(replacedCommand);
      setSelectedCommand(null);
      await invoke("hide_popover_window");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePlaceholderCancel = () => {
    setSelectedCommand(null);
  };

  return (
    <div className="popover-container">
      <div className="popover-header">
        <div className="popover-search-box">
          <Search size={14} style={{ color: "var(--color-text-placeholder)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="popover-search-input"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="popover-clear-button"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPinned(!pinned)}
          className="popover-pin-button"
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
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

async function hidePopover() {
  try {
    await invoke("hide_popover_window");
  } catch (err) {
    console.error("Failed to hide popover:", err);
  }
}
