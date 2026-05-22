import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface InputDialogProps {
  open: boolean;
  title: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputDialog({
  open,
  title,
  placeholder,
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  function handleConfirm() {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60]"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl p-5 max-w-sm w-full"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") onCancel();
          }}
          placeholder={placeholder}
          className="w-full text-sm outline-none mb-4"
          style={{
            height: "28px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
          }}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {t("deleteConfirm.cancel")}
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm}>
            {t("deleteConfirm.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
