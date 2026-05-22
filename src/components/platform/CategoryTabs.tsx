import { useQuery } from "@tanstack/react-query";
import * as categoryRepository from "../../data/repositories/categoryRepository";
import { queryKeys } from "../../state/queryKeys";
import { useUiStore } from "../../state/uiStore";

export function CategoryTabs() {
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const currentCategoryId = useUiStore((s) => s.currentCategoryId);
  const setCurrentCategory = useUiStore((s) => s.setCurrentCategory);

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(currentPlatformId ?? ""),
    queryFn: () => categoryRepository.listCategories(currentPlatformId!),
    enabled: !!currentPlatformId,
  });

  if (!currentPlatformId || !categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto"
      style={{ borderColor: "var(--color-border)" }}
    >
      <TabButton
        label="全部"
        isActive={currentCategoryId === null}
        onClick={() => setCurrentCategory(null)}
      />
      {categories.map((cat) => (
        <TabButton
          key={cat.id}
          label={cat.name}
          isActive={currentCategoryId === cat.id}
          onClick={() => setCurrentCategory(cat.id)}
        />
      ))}
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
