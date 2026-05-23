import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { parsePlaceholders, replacePlaceholders } from "../../domain/placeholders";
import { getVariableHistories } from "../../data/repositories/commandRepository";
import type { Command } from "../../domain/types";

interface OverlayPlaceholderFloatProps {
  command: Command;
  onComplete: (replacedCommand: string) => void;
  onCancel: () => void;
}

export function OverlayPlaceholderFloat({
  command,
  onComplete,
  onCancel,
}: OverlayPlaceholderFloatProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const segments = parsePlaceholders(command.command);
  const placeholders = segments.filter((s) => s.type === "placeholder");
  const uniquePlaceholders = placeholders.filter(
    (p, index, self) => index === self.findIndex((s) => s.name === p.name),
  );

  // 加载变量记忆
  useEffect(() => {
    const loadHistories = async () => {
      try {
        const histories = await getVariableHistories(command.id);
        setValues(histories);
      } catch (err) {
        console.error("Failed to load variable histories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistories();
  }, [command.id]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          setFocusedIndex((i) => Math.max(0, i - 1));
        } else {
          setFocusedIndex((i) => Math.min(uniquePlaceholders.length - 1, i + 1));
        }
        break;
      case "Enter":
        e.preventDefault();
        handleComplete();
        break;
      case "Escape":
        e.preventDefault();
        onCancel();
        break;
    }
  };

  // 完成填写
  const handleComplete = () => {
    const replacedCommand = replacePlaceholders(command.command, values);
    onComplete(replacedCommand);
  };

  // 更新值
  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="overlay-placeholder-float">
        <div className="overlay-placeholder-loading">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="overlay-placeholder-float" onKeyDown={handleKeyDown}>
      <div className="overlay-placeholder-header">
        <span className="overlay-placeholder-title">{t("overlay.fillVariables")}</span>
        <button type="button" onClick={onCancel} className="overlay-placeholder-cancel">
          ×
        </button>
      </div>

      <div className="overlay-placeholder-fields">
        {uniquePlaceholders.map((placeholder, index) => (
          <div key={placeholder.name} className="overlay-placeholder-field">
            <label className="overlay-placeholder-label">{placeholder.name}</label>
            <input
              type="text"
              value={values[placeholder.name!] || ""}
              onChange={(e) => handleChange(placeholder.name!, e.target.value)}
              placeholder={placeholder.name}
              autoFocus={index === focusedIndex}
              className="overlay-placeholder-input"
            />
          </div>
        ))}
      </div>

      <div className="overlay-placeholder-actions">
        <button
          type="button"
          onClick={onCancel}
          className="overlay-placeholder-button overlay-placeholder-button-cancel"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={handleComplete}
          className="overlay-placeholder-button overlay-placeholder-button-copy"
        >
          {t("overlay.copy")}
        </button>
      </div>
    </div>
  );
}
