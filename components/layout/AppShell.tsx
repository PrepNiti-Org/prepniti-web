"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidenav } from "./Sidenav";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

    if (isAuthPage) {
        return <div className="w-full min-h-screen overflow-y-auto lg:overflow-hidden bg-background">{children}</div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Top Navigation Bar (Full Width) */}
            <Navbar />

            {/* Main Layout Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex flex-col shrink-0 border-r bg-background/50 backdrop-blur-xl transition-all duration-300">
                    <Sidenav isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                </div>

                {/* Main Content Area — pb-20 leaves room for mobile bottom nav */}
                <main className="flex-1 overflow-y-auto relative py-4 sm:py-8 px-3 sm:px-6 md:px-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
