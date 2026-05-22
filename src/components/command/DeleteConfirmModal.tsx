import { useState } from "react";
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

export function DeleteConfirmModal({
  open,
  commandId,
  onClose,
}: DeleteConfirmModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commandRepository.deleteCommand(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast("已删除", "success");
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || "删除失败");
      toast("删除失败", "error");
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
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={isDeleting}
      >
        取消
      </Button>
      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "删除中..." : "删除"}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="确定删除这条命令吗？"
      footer={footer}
    >
      <div className="flex flex-col gap-3">
        <p
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          删除后不可恢复。
        </p>
        {error && (
          <p
            className="text-xs"
            style={{ color: "var(--color-state-danger)" }}
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
