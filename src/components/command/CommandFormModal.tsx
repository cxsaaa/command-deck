import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { TagInput } from "./TagInput";
import { DynamicListInput } from "./DynamicListInput";
import { DynamicParamInput } from "./DynamicParamInput";
import { toast } from "../common/Toast";
import { queryKeys } from "../../state/queryKeys";
import * as platformRepository from "../../data/repositories/platformRepository";
import * as categoryRepository from "../../data/repositories/categoryRepository";
import * as commandRepository from "../../data/repositories/commandRepository";
import {
  validateCommandInput,
  type ValidationError,
} from "../../domain/validation";
import type { CommandInput, CommandParameter } from "../../domain/types";

interface CommandFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  commandId?: string;
  initialTitle?: string;
}

export function CommandFormModal({
  open,
  onClose,
  mode,
  commandId,
  initialTitle,
}: CommandFormModalProps) {
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [commandText, setCommandText] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [examples, setExamples] = useState<string[]>([]);
  const [parameters, setParameters] = useState<CommandParameter[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch platforms
  const { data: platforms } = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: () => platformRepository.listPlatforms(),
  });

  // Fetch categories for selected platform
  const { data: categories } = useQuery({
    queryKey: queryKeys.categories(platformId),
    queryFn: () => categoryRepository.listCategories(platformId),
    enabled: !!platformId,
  });

  // Fetch existing command data in edit mode
  const { data: existingCommand, isLoading: isLoadingCommand } = useQuery({
    queryKey: queryKeys.command(commandId ?? ""),
    queryFn: () => commandRepository.getCommand(commandId!),
    enabled: mode === "edit" && !!commandId && open,
  });

  // Populate form when existing command loads
  useEffect(() => {
    if (mode === "edit" && existingCommand) {
      setTitle(existingCommand.title);
      setPlatformId(existingCommand.platformId);
      setCategoryId(existingCommand.categoryId ?? "");
      setCommandText(existingCommand.command);
      setDescription(existingCommand.description ?? "");
      setTags(existingCommand.tags);
      setExamples(existingCommand.examples);
      setParameters(existingCommand.parameters);
      setNotes(existingCommand.notes ?? "");
    }
  }, [mode, existingCommand]);

  // Reset form when modal opens in create mode
  useEffect(() => {
    if (open && mode === "create") {
      setTitle(initialTitle ?? "");
      setPlatformId("");
      setCategoryId("");
      setCommandText("");
      setDescription("");
      setTags([]);
      setExamples([]);
      setParameters([]);
      setNotes("");
      setErrors([]);
      setSubmitError(null);
    }
  }, [open, mode, initialTitle]);

  // Reset errors when modal closes
  useEffect(() => {
    if (!open) {
      setErrors([]);
      setSubmitError(null);
    }
  }, [open]);

  // Reset category when platform changes
  useEffect(() => {
    setCategoryId("");
  }, [platformId]);

  // Build validation maps
  const platformIds = useMemo(
    () => platforms?.map((p) => p.id) ?? [],
    [platforms],
  );

  const categoryPlatformMap = useMemo(() => {
    const map = new Map<string, string>();
    if (categories) {
      for (const cat of categories) {
        map.set(cat.id, cat.platformId);
      }
    }
    return map;
  }, [categories]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (input: CommandInput) =>
      commandRepository.createCommand(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast("已保存", "success");
      onClose();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "保存失败");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: CommandInput) =>
      commandRepository.updateCommand(commandId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast("已保存", "success");
      onClose();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "保存失败");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function getError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    doSubmit();
  }

  function doSubmit() {
    const input: CommandInput = {
      title: title.trim(),
      command: commandText.trim(),
      platformId,
      categoryId: categoryId || undefined,
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      examples: examples.filter((ex) => ex.trim().length > 0),
      parameters: parameters.filter(
        (p) => p.name.trim().length > 0 && p.description.trim().length > 0,
      ),
      notes: notes.trim() || undefined,
    };

    const validationErrors = validateCommandInput(
      input,
      platformIds,
      categoryPlatformMap,
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSubmitError(null);

    if (mode === "edit") {
      updateMutation.mutate(input);
    } else {
      createMutation.mutate(input);
    }
  }

  const isLoading = mode === "edit" && isLoadingCommand;

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        取消
      </Button>
      <Button
        variant="primary"
        onClick={doSubmit}
        disabled={isSaving || isLoading}
      >
        {isSaving ? "保存中..." : "保存"}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "新建命令" : "编辑命令"}
      maxWidth="560px"
      footer={footer}
    >
      {isLoading ? (
        <div
          className="flex items-center justify-center"
          style={{ height: "200px", color: "var(--color-text-tertiary)" }}
        >
          加载中...
        </div>
      ) : (
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col"
          style={{ gap: "16px" }}
        >
          {/* Title */}
          <FormField label="标题" required error={getError("title")}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="命令标题"
              className="w-full text-sm outline-none"
              style={inputStyle}
            />
          </FormField>

          {/* Platform */}
          <FormField label="平台" required error={getError("platformId")}>
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className="w-full text-sm outline-none"
              style={inputStyle}
            >
              <option value="">选择平台</option>
              {platforms?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Category */}
          <FormField label="分类" error={getError("categoryId")}>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!platformId}
              className="w-full text-sm outline-none"
              style={{
                ...inputStyle,
                opacity: !platformId ? 0.5 : 1,
              }}
            >
              <option value="">无分类</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Command */}
          <FormField label="命令内容" required error={getError("command")}>
            <textarea
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="输入命令"
              rows={3}
              className="w-full text-sm outline-none resize-y"
              style={{
                ...inputStyle,
                fontFamily: "'SF Mono', Menlo, monospace",
                minHeight: "80px",
              }}
            />
          </FormField>

          {/* Description */}
          <FormField label="描述" error={getError("description")}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="命令用途说明"
              rows={2}
              className="w-full text-sm outline-none resize-y"
              style={{ ...inputStyle, minHeight: "60px" }}
            />
          </FormField>

          {/* Tags */}
          <FormField label="标签" error={getError("tags")}>
            <TagInput tags={tags} onChange={setTags} />
            <HelperText>按 Enter 或逗号添加标签</HelperText>
          </FormField>

          {/* Examples */}
          <FormField label="示例">
            <DynamicListInput
              items={examples}
              onChange={setExamples}
              placeholder="输入示例命令"
              addLabel="添加示例"
            />
          </FormField>

          {/* Parameters */}
          <FormField label="参数说明">
            <DynamicParamInput items={parameters} onChange={setParameters} />
          </FormField>

          {/* Notes */}
          <FormField label="备注">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="补充说明"
              rows={2}
              className="w-full text-sm outline-none resize-y"
              style={{ ...inputStyle, minHeight: "60px" }}
            />
          </FormField>

          {/* Submit error */}
          {submitError && (
            <p
              className="text-xs"
              style={{ color: "var(--color-state-danger)" }}
            >
              {submitError}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "6px" }}>
      <label
        className="text-sm font-medium"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-state-danger)", marginLeft: 2 }}>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "var(--color-state-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared input style                                                 */
/* ------------------------------------------------------------------ */

const inputStyle: React.CSSProperties = {
  height: "36px",
  padding: "0 10px",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  backgroundColor: "var(--color-bg-surface)",
  color: "var(--color-text-primary)",
};
