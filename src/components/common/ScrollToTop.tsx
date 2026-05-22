import { useState, useEffect, type RefObject } from "react";
import { ChevronUp } from "lucide-react";

interface ScrollToTopProps {
  scrollRef: RefObject<HTMLElement | null>;
}

export function ScrollToTop({ scrollRef }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onScroll() {
      setVisible(el!.scrollTop > 300);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        color: "var(--color-text-secondary)",
        zIndex: 50,
      }}
      title="回到顶部"
    >
      <ChevronUp size={18} />
    </button>
  );
}
