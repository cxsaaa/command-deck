import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, footer, maxWidth = "560px" }: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 50,
          }}
        />

        {/* Content */}
        <Dialog.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            maxWidth,
            maxHeight: "80vh",
            backgroundColor: "var(--color-bg-surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            zIndex: 51,
            outline: "none",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4" style={{ minHeight: "32px" }}>
            <Dialog.Title
              className="text-base font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center transition-colors"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "transparent",
                  color: "var(--color-text-tertiary)",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-text-tertiary)";
                }}
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className="flex items-center justify-end gap-2 mt-6 pt-4 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
