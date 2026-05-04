"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
    HomeIcon,
    LayoutDashboard,
    MessageSquare,
    Menu,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Tracker", href: "/tracker", icon: LayoutDashboard },
    { name: "Discussions", href: "/posts", icon: MessageSquare },
];

interface SidenavProps {
    className?: string;
    onItemClick?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function Sidenav({ className = "", onItemClick, isCollapsed = false, onToggle }: SidenavProps) {
    const pathname = usePathname();

    const hiddenRoutes = ["/login", "/register"];
    if (hiddenRoutes.includes(pathname)) return null;

    return (
        <aside className={`flex flex-col h-full bg-sidebar border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} ${className}`}>
            <div className={`h-14 flex items-center shrink-0 border-b border-transparent ${isCollapsed ? "justify-center" : "px-3"}`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={onToggle} aria-label="Toggle Sidebar">
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
                {navLinks.map((link) => {
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    const Icon = link.icon;

                    const LinkContent = (
                        <Link
                            href={link.href}
                            onClick={onItemClick}
                            className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                ? "text-sidebar-primary-foreground"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidenav-active-bg"
                                    className="absolute inset-0 rounded-xl bg-sidebar-primary"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <Icon className={`relative z-10 h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-sm" : "group-hover:scale-110"}`} />

                            <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "auto", opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative z-10 whitespace-nowrap overflow-hidden tracking-wide"
                                    >
                                        {link.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );

                    if (isCollapsed) {
                        return (
                            <TooltipProvider delayDuration={0} key={link.name}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {LinkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="flex items-center gap-4">
                                        {link.name}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }

                    return <div key={link.name}>{LinkContent}</div>;
                })}
            </div>
        </aside>
    );
}
