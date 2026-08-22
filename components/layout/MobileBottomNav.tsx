"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserProfile } from "@/features/profile/api";
import { SidenavCountdownCard, ExamCountdownModal } from "@/features/countdown";
import { navLinks } from "./Sidenav";

export function MobileBottomNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoggedIn, user: authUser } = useAuth();

    const { data: profileUser } = useQuery({
        queryKey: ["profile"],
        queryFn: getUserProfile,
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5,
    });
    const user = profileUser || authUser;

    const hiddenRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    if (hiddenRoutes.includes(pathname)) return null;

    const primaryLinks = [
        navLinks.find((l) => l.href === "/tracker") || navLinks[0],
        navLinks.find((l) => l.href === "/focus") || navLinks[1],
        navLinks.find((l) => l.href === "/mock-tests") || navLinks[2],
        navLinks.find((l) => l.href === "/") || navLinks[4],
        navLinks.find((l) => l.href === "/chat") || navLinks[7],
    ].filter(Boolean);

    const moreLinks = [
        navLinks.find((l) => l.href === "/insights") || navLinks[3],
        navLinks.find((l) => l.href === "/posts") || navLinks[5],
        navLinks.find((l) => l.href === "/buddies") || navLinks[6],
    ].filter(Boolean);

    const isMoreActive = moreLinks.some(link => link && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)));

    return (
        <>
            <nav
                data-tour="mobile-bottom-nav"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar/90 backdrop-blur-[32px] backdrop-saturate-200 border-t border-sidebar-border safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sidebar-foreground/10 to-transparent" />

                <div className="flex items-center justify-around h-16 px-1 relative">
                    {primaryLinks.map((link) => {
                        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                        const Icon = link.icon;
                        const tourId = `mobile-nav-${link.href.replace("/", "") || "home"}`;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                data-tour={tourId}
                                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-0.5 transition-colors z-10 ${
                                    isActive
                                        ? "text-sidebar-primary"
                                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                }`}
                                aria-label={link.name}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="liquid-indicator"
                                        className="absolute inset-0 my-1 mx-2 bg-sidebar-primary/20 rounded-2xl -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 25,
                                            mass: 0.8
                                        }}
                                    />
                                )}

                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="relative flex items-center justify-center"
                                >
                                    <Icon
                                        className={`h-5 w-5 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-sm" : ""}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        fill={isActive ? "currentColor" : "none"}
                                    />
                                </motion.div>
                                <span className={`text-[9px] sm:text-[10px] tracking-tighter font-semibold leading-none transition-colors ${
                                    isActive ? "text-sidebar-primary" : ""
                                }`}>
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* More Trigger Tab */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button
                                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-0.5 transition-colors z-10 ${
                                    isMoreActive
                                        ? "text-sidebar-primary"
                                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                }`}
                                aria-label="More options"
                            >
                                {isMoreActive && (
                                    <motion.div
                                        layoutId="liquid-indicator"
                                        className="absolute inset-0 my-1 mx-2 bg-sidebar-primary/20 rounded-2xl -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 25,
                                            mass: 0.8
                                        }}
                                    />
                                )}
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="relative flex items-center justify-center"
                                >
                                    <MoreHorizontal
                                        className={`h-5 w-5 transition-all duration-300 ${isMoreActive ? "scale-110 drop-shadow-sm" : ""}`}
                                        strokeWidth={isMoreActive ? 2.5 : 2}
                                    />
                                </motion.div>
                                <span className={`text-[9px] sm:text-[10px] tracking-tighter font-semibold leading-none transition-colors ${
                                    isMoreActive ? "text-sidebar-primary" : ""
                                }`}>
                                    More
                                </span>
                            </button>
                        </SheetTrigger>

                        <SheetContent side="bottom" className="rounded-t-[28px] p-5 pt-3 bg-background/95 border-t border-border shadow-2xl pb-8">
                            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
                            
                            <SheetTitle className="sr-only">Menu & Focus Countdown</SheetTitle>
                            <SheetDescription className="sr-only">Target countdown and additional navigation</SheetDescription>

                            <div className="pb-2">
                                <SidenavCountdownCard
                                    user={user}
                                    isCollapsed={false}
                                    onClick={() => {
                                        setOpen(false);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                {moreLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isLinkActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                                                isLinkActive
                                                    ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-xs"
                                                    : "bg-muted/40 border-border/50 text-foreground/80 hover:bg-muted"
                                            }`}
                                        >
                                            <Icon className="h-4.5 w-4.5 shrink-0" />
                                            <span className="text-xs font-semibold tracking-tight">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>

            <ExamCountdownModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                userProfile={user}
            />
        </>
    );
}
