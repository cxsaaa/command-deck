import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { toast } from "../common/Toast";
import * as commandRepository from "../../data/repositories/commandRepository";

interface DeleteConfirmModalProps {
  open: boolean;
  commandId: string | null;
  onClose: () => void;
}

export function DeleteConfirmModal({ open, commandId, onClose }: DeleteConfirmModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commandRepository.deleteCommand(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast(t("deleteConfirm.deleted"), "success");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || t("deleteConfirm.deleteFailed"));
      toast(t("deleteConfirm.deleteFailed"), "error");
    },
  });

  function handleDelete() {
    if (!commandId) return;
    setError(null);
    deleteMutation.mutate(commandId);
  }

  function handleClose() {
    if (deleteMutation.isPending) return;
    setError(null);
    onClose();
  }

  const isDeleting = deleteMutation.isPending;

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
        {t("deleteConfirm.cancel")}
      </Button>
      <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? t("deleteConfirm.deleting") : t("deleteConfirm.delete")}
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={handleClose} title={t("deleteConfirm.title")} footer={footer}>
      <div className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {t("deleteConfirm.description")}
        </p>
        {error && (
          <p className="text-xs" style={{ color: "var(--color-state-danger)" }}>
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
