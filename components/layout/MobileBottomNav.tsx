"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./Sidenav";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function MobileBottomNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const hiddenRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    if (hiddenRoutes.includes(pathname)) return null;

    const primaryLinks = [
        navLinks[0], // Home
        navLinks[6], // Mock Tests
        navLinks[1], // Tracker
        navLinks[2], // Discussions
        navLinks[3], // Chat
    ];
    const moreLinks = [
        navLinks[4], // Buddies
        navLinks[5], // Insights
    ];

    const isMoreActive = moreLinks.some(link => link.href === "/" ? pathname === "/" : pathname.startsWith(link.href));

    return (
        <nav
            data-tour="mobile-bottom-nav"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar/85 backdrop-blur-[32px] backdrop-saturate-[200%] border-t border-sidebar-border safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
        >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sidebar-foreground/10 to-transparent" />

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
                            className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-0.5 transition-colors z-10 ${isActive
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
                            <span className={`text-[9px] sm:text-[10px] tracking-tighter font-semibold leading-none transition-colors ${isActive ? "text-sidebar-primary" : ""
                                }`}>
                                {link.name}
                            </span>
                        </Link>
                    );
                })}

                {/* More Tab Trigger */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-0.5 transition-colors z-10 ${isMoreActive
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
                            <span className={`text-[9px] sm:text-[10px] tracking-tighter font-semibold leading-none transition-colors ${isMoreActive ? "text-sidebar-primary" : ""
                                }`}>
                                More
                            </span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-[32px] p-6 bg-background/95 border-t border-border shadow-2xl pb-10">
                        <SheetTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">More Features</SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground mt-0.5">Explore additional tools on PrepNiti.</SheetDescription>
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            {moreLinks.map((link) => {
                                const Icon = link.icon;
                                const isLinkActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${
                                            isLinkActive
                                                ? "bg-primary/10 border-primary/20 text-primary font-bold shadow-sm"
                                                : "bg-muted/40 border-border/50 text-foreground/80 hover:bg-muted"
                                        }`}
                                    >
                                        <Icon className="h-6 w-6 stroke-[2px]" />
                                        <span className="text-[11px] font-semibold tracking-tight">{link.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
