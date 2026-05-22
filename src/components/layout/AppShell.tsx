import { ReactNode, useRef } from "react";
import { ScrollToTop } from "../common/ScrollToTop";

interface AppShellProps {
  topBar: ReactNode;
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  density?: "comfortable" | "compact";
}

export function AppShell({ topBar, sidebar, header, children, density = "comfortable" }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div
      data-density={density}
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky header (CategoryTabs) */}
          {header}
          {/* Scrollable content */}
          <main
            ref={mainRef}
            className="flex-1 overflow-auto"
            style={{ backgroundColor: "var(--color-bg-app)" }}
          >
            {children}
          </main>
          <ScrollToTop scrollRef={mainRef} />
        </div>
      </div>
    </div>
  );
}
