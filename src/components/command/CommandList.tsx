import { CommandCard } from "./CommandCard";
import type { Command } from "../../domain/types";

interface CommandListProps {
  commands: Command[];
  selectedResultIndex?: number;
  searchQuery?: string;
}

export function CommandList({
  commands,
  selectedResultIndex = -1,
  searchQuery,
}: CommandListProps) {
  return (
    <div className="flex flex-col px-4 pb-4" style={{ gap: "var(--density-list-gap)" }}>
      {commands.map((command, index) => (
        <CommandCard
          key={command.id}
          command={command}
          isSelected={selectedResultIndex === index}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
