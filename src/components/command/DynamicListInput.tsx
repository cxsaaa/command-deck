import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DynamicListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export function DynamicListInput({
  items,
  onChange,
  placeholder,
  addLabel,
}: DynamicListInputProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("dynamicList.defaultPlaceholder");
  const resolvedAddLabel = addLabel ?? t("dynamicList.defaultAddLabel");
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  // Filter out empty items on blur
  function handleBlur() {
    const filtered = items.filter((item) => item.trim().length > 0);
    if (filtered.length !== items.length) {
      onChange(filtered);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            onBlur={handleBlur}
            placeholder={resolvedPlaceholder}
            className="flex-1 text-sm outline-none"
            style={{
              height: "36px",
              padding: "0 10px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="inline-flex items-center justify-center flex-shrink-0"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-state-danger-soft)";
              e.currentTarget.style.color = "var(--color-state-danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-tertiary)";
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 text-sm font-medium self-start"
        style={{
          height: "32px",
          padding: "0 10px",
          border: "1px dashed var(--color-border)",
          borderRadius: "var(--radius-md)",
          background: "none",
          cursor: "pointer",
          color: "var(--color-text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-accent)";
          e.currentTarget.style.color = "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        <Plus size={14} />
        {resolvedAddLabel}
      </button>
    </div>
  );
}
