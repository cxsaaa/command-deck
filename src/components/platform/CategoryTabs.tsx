import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { CategoryContextMenu } from "./CategoryContextMenu";
import { InputDialog } from "../common/InputDialog";
import * as categoryRepository from "../../data/repositories/categoryRepository";
import { queryKeys } from "../../state/queryKeys";
import { useUiStore } from "../../state/uiStore";

export function CategoryTabs() {
  const { t } = useTranslation();
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const currentCategoryId = useUiStore((s) => s.currentCategoryId);
  const setCurrentCategory = useUiStore((s) => s.setCurrentCategory);
  const categoryRenameId = useUiStore((s) => s.categoryRenameId);
  const setCategoryRenameId = useUiStore((s) => s.setCategoryRenameId);
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(currentPlatformId ?? ""),
    queryFn: () => categoryRepository.listCategories(currentPlatformId!),
    enabled: !!currentPlatformId,
  });

  async function handleRename(id: string, name: string) {
    await categoryRepository.renameCategory(id, name);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories(currentPlatformId ?? ""),
    });
    setCategoryRenameId(null);
  }

  async function handleDelete(id: string) {
    if (!currentPlatformId) return;
    await categoryRepository.deleteCategory(id, currentPlatformId);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories(currentPlatformId),
    });
    if (currentCategoryId === id) {
      setCurrentCategory(null);
    }
  }

  async function handleMove(id: string, direction: "left" | "right") {
    await categoryRepository.moveCategory(id, direction);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories(currentPlatformId ?? ""),
    });
  }

  async function handleAddCategory(name: string) {
    if (!currentPlatformId) return;
    const cat = await categoryRepository.createCategory(name, currentPlatformId);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories(currentPlatformId),
    });
    setCurrentCategory(cat.id);
    setIsAdding(false);
  }

  if (navType !== "platform" || !currentPlatformId || !categories || categories.length === 0) {
    return null;
  }

  // Filter out uncategorized for display, but keep it for operations
  const displayCategories = categories.filter(
    (c) => !c.id.startsWith("uncategorized_")
  );

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto shrink-0"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <TabButton
        label={t("categoryTabs.all")}
        isActive={currentCategoryId === null}
        onClick={() => setCurrentCategory(null)}
      />
      {displayCategories.map((cat, index) => (
        <CategoryContextMenu
          key={cat.id}
          onRename={() => setCategoryRenameId(cat.id)}
          onDelete={() => handleDelete(cat.id)}
          onMoveLeft={() => handleMove(cat.id, "left")}
          onMoveRight={() => handleMove(cat.id, "right")}
          canMoveLeft={index > 0}
          canMoveRight={index < displayCategories.length - 1}
        >
          {categoryRenameId === cat.id ? (
            <InlineRenameInput
              defaultValue={cat.name}
              onCommit={(name) => handleRename(cat.id, name)}
              onCancel={() => setCategoryRenameId(null)}
            />
          ) : (
            <TabButton
              label={cat.name}
              isActive={currentCategoryId === cat.id}
              onClick={() => setCurrentCategory(cat.id)}
            />
          )}
        </CategoryContextMenu>
      ))}

      {/* Add category */}
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="inline-flex items-center justify-center shrink-0 cursor-pointer"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: "none",
          color: "var(--color-text-tertiary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-accent)";
          e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-text-tertiary)";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        title={t("category.add")}
      >
        <Plus size={14} />
      </button>

      <InputDialog
        open={isAdding}
        title={t("category.add")}
        placeholder={t("category.addPlaceholder")}
        onConfirm={handleAddCategory}
        onCancel={() => setIsAdding(false)}
      />
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-md text-sm whitespace-nowrap transition-colors"
      style={{
        backgroundColor: isActive ? "var(--color-accent-soft)" : "transparent",
        color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
        border: isActive
          ? "1px solid var(--color-accent-border)"
          : "1px solid transparent",
        fontWeight: isActive ? 500 : 400,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

interface InlineRenameInputProps {
  defaultValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

function InlineRenameInput({ defaultValue, onCommit, onCancel }: InlineRenameInputProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(value);
        if (e.key === "Escape") onCancel();
      }}
      className="text-sm outline-none"
      style={{
        border: "1px solid var(--color-accent)",
        borderRadius: "var(--radius-sm)",
        padding: "2px 6px",
        minWidth: "60px",
        maxWidth: "120px",
        backgroundColor: "var(--color-bg-surface)",
        color: "var(--color-text-primary)",
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
