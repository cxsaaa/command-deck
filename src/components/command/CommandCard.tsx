import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Star, Edit, Trash, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CommandCodeBlock } from "./CommandCodeBlock";
import { Button } from "../common/Button";
import { IconButton } from "../common/IconButton";
import { MoreMenu } from "../common/MoreMenu";
import { toast } from "../common/Toast";
import * as commandRepository from "../../data/repositories/commandRepository";
import { useUiStore } from "../../state/uiStore";
import { queryKeys } from "../../state/queryKeys";
import { highlightText } from "../../domain/highlight";
import {
  hasPlaceholders,
  replacePlaceholders,
} from "../../domain/placeholders";
import type { Command } from "../../domain/types";

interface CommandCardProps {
  command: Command;
  isSelected?: boolean;
  searchQuery?: string;
}

export function CommandCard({ command, isSelected = false, searchQuery }: CommandCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const openEditCommandModal = useUiStore((s) => s.openEditCommandModal);
  const openDeleteConfirm = useUiStore((s) => s.openDeleteConfirm);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const isInteractive = hasPlaceholders(command.command);

  // Load variable memory from DB
  const { data: savedVariables } = useQuery({
    queryKey: queryKeys.variableHistories(command.id),
    queryFn: () => commandRepository.getVariableHistories(command.id),
    enabled: isInteractive,
  });

  // Initialize variableValues from saved memory (only once per mount)
  useEffect(() => {
    if (!initializedRef.current && savedVariables) {
      initializedRef.current = true;
      if (Object.keys(savedVariables).length > 0) {
        setVariableValues(savedVariables);
      }
    }
  }, [savedVariables]);

  const handleVariableChange = useCallback((name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  const handleCopy = useCallback(async () => {
    try {
      const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
      const textToCopy = isInteractive
        ? replacePlaceholders(command.command, variableValues)
        : command.command;
      await writeText(textToCopy);
      await commandRepository.recordCommandCopied(command.id);
      // Save variable memory
      if (isInteractive && Object.keys(variableValues).length > 0) {
        await commandRepository.saveVariableHistories(command.id, variableValues);
      }
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
      await queryClient.invalidateQueries();
    } catch {
      toast(t("command.copyFailed"), "error");
    }
  }, [command.command, command.id, queryClient, isInteractive, variableValues]);

  async function handleToggleFavorite() {
    try {
      await commandRepository.toggleFavorite(command.id);
      await queryClient.invalidateQueries();
    } catch {
      toast(t("command.actionFailed"), "error");
    }
  }

  const metaParts = [
    command.platformName,
    command.categoryName,
    ...command.tags,
  ].filter(Boolean);

  const hasDetails = (command.examples?.length ?? 0) > 0
    || (command.parameters?.length ?? 0) > 0
    || !!command.notes;

  return (
    <div
      ref={cardRef}
      className="rounded-lg transition-colors"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: isSelected
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--density-card-padding-y) var(--density-card-padding-x)",
        boxShadow: isSelected ? "0 0 0 2px var(--color-accent-soft)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {searchQuery ? highlightText(command.title, searchQuery) : command.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {hasDetails && (
            <IconButton
              icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              tooltip={isExpanded ? t("command.collapse") : t("command.expand")}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
          <IconButton
            icon={
              command.isFavorite ? (
                <Star size={16} fill="currentColor" />
              ) : (
                <Star size={16} />
              )
            }
            tooltip={command.isFavorite ? t("command.unfavorite") : t("command.favorite")}
            active={command.isFavorite}
            onClick={handleToggleFavorite}
          />
          <MoreMenu
            items={[
              {
                id: "edit",
                label: t("command.edit"),
                icon: <Edit size={14} />,
                onClick: () => openEditCommandModal(command.id),
              },
              {
                id: "delete",
                label: t("command.delete"),
                icon: <Trash size={14} />,
                danger: true,
                onClick: () => openDeleteConfirm(command.id),
              },
            ]}
          />
        </div>
      </div>

      {/* Code block */}
      <div className="mb-1.5">
        <CommandCodeBlock
          code={command.command}
          maxLines={2}
          searchQuery={searchQuery}
          interactive={isInteractive}
          variableValues={variableValues}
          onVariableChange={handleVariableChange}
        />
      </div>

      {/* Description */}
      {command.description && (
        <p
          className="text-xs leading-relaxed mb-1.5"
          style={{
            color: "var(--color-text-secondary)",
            display: "var(--density-description-display)",
          }}
        >
          {searchQuery ? highlightText(command.description, searchQuery) : command.description}
        </p>
      )}

      {/* Expanded details */}
      {isExpanded && hasDetails && (
        <div
          className="mb-1.5 pt-1.5"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {command.examples && command.examples.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                {t("command.examples")}
              </span>
              {command.examples.map((ex, i) => (
                <div key={i} className="mb-1">
                  <CommandCodeBlock code={ex} maxLines={10} searchQuery={searchQuery} />
                </div>
              ))}
            </div>
          )}
          {command.parameters && command.parameters.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                {t("command.parameters")}
              </span>
              {command.parameters.map((p, i) => (
                <div key={i} className="flex gap-2 text-xs mb-0.5">
                  <code className="font-mono shrink-0" style={{ color: "var(--color-accent)" }}>{p.name}</code>
                  <span style={{ color: "var(--color-text-tertiary)" }}>{p.description}</span>
                </div>
              ))}
            </div>
          )}
          {command.notes && (
            <div>
              <span className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                {t("command.notes")}
              </span>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{command.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer: meta + copy */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs truncate"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {metaParts.join(" · ")}
        </span>
        <Button
          variant={copied ? "secondary" : "primary"}
          size="sm"
          onClick={handleCopy}
          style={copied ? {
            backgroundColor: "var(--color-state-success-soft)",
            color: "var(--color-state-success)",
            borderColor: "var(--color-state-success)",
            minWidth: 56,
          } : { minWidth: 56 }}
        >
          {copied ? <><Check size={14} /> {t("command.copied")}</> : t("command.copy")}
        </Button>
      </div>
    </div>
  );
}
