"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidenav } from "./Sidenav";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

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

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative py-8 px-4 sm:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
