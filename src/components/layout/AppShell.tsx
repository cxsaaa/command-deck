import { ReactNode } from "react";

interface AppShellProps {
  topBar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ topBar, sidebar, children }: AppShellProps) {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-app)" }}
    >
      {/* Top Bar */}
      {topBar}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar}

        {/* Content Area */}
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "var(--color-bg-app)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
