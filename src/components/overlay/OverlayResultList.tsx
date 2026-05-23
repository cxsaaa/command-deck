import { useEffect, useRef } from "react";
import type { Command } from "../../domain/types";

interface OverlayResultListProps {
  results: Command[];
  selectedIndex: number;
  query?: string;
  onSelect: (command: Command) => void;
}

export function OverlayResultList({
  results,
  selectedIndex,
  query = "",
  onSelect,
}: OverlayResultListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // 滚动到选中项
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // 截断命令文本
  const truncateCommand = (command: string, maxLength: number = 60) => {
    if (command.length <= maxLength) return command;
    return command.substring(0, maxLength) + "...";
  };

  // 高亮关键词
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="overlay-highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div ref={listRef} className="overlay-result-list">
      {results.map((command, index) => (
        <div
          key={command.id}
          ref={index === selectedIndex ? selectedRef : null}
          className={`overlay-result-item ${
            index === selectedIndex ? "overlay-result-item-selected" : ""
          }`}
          onClick={() => onSelect(command)}
          onMouseEnter={() => {}}
        >
          <div className="overlay-result-title">{highlightMatch(command.title, query)}</div>
          <div className="overlay-result-command">{truncateCommand(command.command)}</div>
          {command.platformName && (
            <div className="overlay-result-platform">{command.platformName}</div>
          )}
        </div>
      ))}
    </div>
  );
}
