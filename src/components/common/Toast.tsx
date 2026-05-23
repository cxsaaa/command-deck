import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle, XCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Toast queue & context                                              */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: number;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  addToast: (message: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _nextId = 0;
let _externalAdd: ((msg: string, variant?: "success" | "error") => void) | null = null;

/** Imperative toast helper -- works outside React components. */
export function toast(message: string, variant: "success" | "error" = "success") {
  _externalAdd?.(message, variant);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  // Expose to imperative `toast()` helper
  _externalAdd = addToast;

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <RadixToast.Provider swipeDirection="right">
        {toasts.map((t) => (
          <ToastItemView key={t.id} item={t} onRemove={() => remove(t.id)} />
        ))}

        {/* Viewport -- top-right */}
        <RadixToast.Viewport
          style={{
            position: "fixed",
            top: "var(--space-4)",
            right: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            width: "360px",
            maxWidth: "100vw",
            zIndex: 9999,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Single toast                                                       */
/* ------------------------------------------------------------------ */

function ToastItemView({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const isSuccess = item.variant === "success";

  return (
    <RadixToast.Root
      duration={isSuccess ? 1500 : 2200}
      onOpenChange={(open) => {
        if (!open) onRemove();
      }}
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
      }}
    >
      {isSuccess ? (
        <CheckCircle size={16} style={{ color: "var(--color-state-success)", flexShrink: 0 }} />
      ) : (
        <XCircle size={16} style={{ color: "var(--color-state-danger)", flexShrink: 0 }} />
      )}
      <RadixToast.Description className="text-sm" style={{ color: "var(--color-text-primary)" }}>
        {item.message}
      </RadixToast.Description>
    </RadixToast.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook for consuming context inside components                       */
/* ------------------------------------------------------------------ */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
