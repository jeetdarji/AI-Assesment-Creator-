"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#CECECE] lg:bg-[image:linear-gradient(180deg,#EEEEEE_0%,#DADADA_100%)]">
      {/* Sidebar — visible on desktop only */}
      <Sidebar />

      {/* TopBar */}
      <TopBar />

      {/* Main content area */}
      <main className="lg:ml-[calc(var(--sidebar-width)+24px)] pt-[calc(var(--topbar-height)+24px)] min-h-screen pb-24 lg:pb-6 px-3">
        {children}
      </main>
    </div>
  );
}
