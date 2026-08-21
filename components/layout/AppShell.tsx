"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidenav } from "./Sidenav";
import { MobileBottomNav } from "./MobileBottomNav";
import { TourProvider } from "@/features/tour/useAppTour";
import { AppTour } from "@/features/tour/components/AppTour";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

    const handleToggle = () => {
        setIsCollapsed((prev) => !prev);
    };

    if (isAuthPage) {
        return <div className="w-full min-h-screen overflow-y-auto lg:overflow-hidden bg-background">{children}</div>;
    }

    return (
        <TourProvider>
            <div className="flex flex-col h-screen overflow-hidden">
                {/* Top Navigation Bar (Full Width) */}
                <Navbar />

                {/* Main Layout Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:flex flex-col shrink-0">
                        <Sidenav isCollapsed={isCollapsed} onToggle={handleToggle} />
                    </div>

                    {/* Main Content Area - pb-20 leaves room for mobile bottom nav */}
                    <main className={pathname.startsWith("/chat") ? "flex-1 relative overflow-hidden flex flex-col" : "flex-1 overflow-y-auto relative py-4 sm:py-8 px-3 sm:px-6 md:px-8 pb-20 md:pb-8"}>
                        {children}
                    </main>
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />

                <AppTour />
            </div>
        </TourProvider>
    );
}

