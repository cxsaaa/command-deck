import { CommandCard } from "./CommandCard";
import type { Command } from "../../domain/types";

interface CommandListProps {
  commands: Command[];
  selectedResultIndex?: number;
}

export function CommandList({
  commands,
  selectedResultIndex = -1,
}: CommandListProps) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {commands.map((command, index) => (
        <CommandCard
          key={command.id}
          command={command}
          isSelected={selectedResultIndex === index}
        />
      ))}
    </div>
  );
}
