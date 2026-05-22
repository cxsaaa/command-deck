import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    onChange([...tags, trimmed]);
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handleBlur() {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue("");
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "6px 8px",
        minHeight: "36px",
        backgroundColor: "var(--color-bg-surface)",
        cursor: "text",
      }}
      onClick={(e) => {
        const input = e.currentTarget.querySelector("input");
        input?.focus();
      }}
    >
      {tags.map((tag, index) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            borderRadius: "var(--radius-full)",
            padding: "2px 8px",
          }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="inline-flex items-center justify-center"
            style={{
              width: "14px",
              height: "14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--color-accent)",
              padding: 0,
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? t("commandForm.tagsPlaceholder") : ""}
        className="flex-1 min-w-[80px] outline-none text-sm"
        style={{
          border: "none",
          background: "none",
          color: "var(--color-text-primary)",
          padding: 0,
          height: "22px",
        }}
      />
    </div>
  );
}
