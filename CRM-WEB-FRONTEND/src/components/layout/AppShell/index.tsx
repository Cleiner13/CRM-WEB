import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LAYOUT_STYLES, cx } from "@/config/styles";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={LAYOUT_STYLES.shell}>
      <div aria-hidden="true" className={LAYOUT_STYLES.shellBackdrop} />
      <div className={LAYOUT_STYLES.shellGrid}>
        {isSidebarOpen ? (
          <button
            aria-label="Cerrar menu lateral"
            className={LAYOUT_STYLES.sidebarOverlay}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <div
          className={cx(
            LAYOUT_STYLES.sidebarSlot,
            isSidebarOpen ? LAYOUT_STYLES.sidebarSlotOpen : LAYOUT_STYLES.sidebarSlotClosed,
          )}
        >
          <Sidebar compact={!isSidebarOpen} />
        </div>

        <div className={LAYOUT_STYLES.contentArea}>
          <Topbar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((current) => !current)} />
          <main className={LAYOUT_STYLES.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
