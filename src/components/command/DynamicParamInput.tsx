import { Plus, X } from "lucide-react";
import type { CommandParameter } from "../../domain/types";

interface DynamicParamInputProps {
  items: CommandParameter[];
  onChange: (items: CommandParameter[]) => void;
}

export function DynamicParamInput({ items, onChange }: DynamicParamInputProps) {
  function updateItem(
    index: number,
    field: keyof CommandParameter,
    value: string,
  ) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { name: "", description: "" }]);
  }

  // Filter out empty params on blur
  function handleBlur() {
    const filtered = items.filter(
      (p) => p.name.trim().length > 0 || p.description.trim().length > 0,
    );
    if (filtered.length !== items.length) {
      onChange(filtered);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateItem(index, "name", e.target.value)}
            onBlur={handleBlur}
            placeholder="参数名"
            className="text-sm outline-none"
            style={{
              width: "120px",
              height: "36px",
              padding: "0 10px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            value={item.description}
            onChange={(e) => updateItem(index, "description", e.target.value)}
            onBlur={handleBlur}
            placeholder="参数说明"
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
              marginTop: "4px",
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
        添加参数
      </button>
    </div>
  );
}
