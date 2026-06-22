"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import {
    HomeIcon,
    LayoutDashboard,
    MessageSquare,
    Menu,
    TrendingUp,
    GraduationCap,
    Sun,
    Moon,
    Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Tracker", href: "/tracker", icon: LayoutDashboard },
    { name: "Discussions", href: "/posts", icon: MessageSquare },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Mock Tests", href: "/mock-tests", icon: GraduationCap },
];

interface SidenavProps {
    className?: string;
    onItemClick?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    isMobile?: boolean;
}

function MobileThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-9 w-28 ml-4 my-3 bg-sidebar-accent/10 rounded-xl animate-pulse" />;

    const modes = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "System" },
    ];

    return (
        <div className="w-fit ml-4 my-3 p-1 bg-sidebar-accent/20 border border-sidebar-border/30 rounded-xl flex items-center gap-1 relative">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = theme === mode.id;

                return (
                    <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        title={mode.label}
                        aria-label={`Switch to ${mode.label} theme`}
                        className={`relative z-10 h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isSelected ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                            }`}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="mobile-theme-active"
                                className="absolute inset-0 rounded-lg bg-sidebar-primary shadow-sm"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        )}
                        <Icon className="h-4 w-4 relative z-10" />
                    </button>
                );
            })}
        </div>
    );
}

export function Sidenav({ className = "", onItemClick, isCollapsed = false, onToggle, isMobile = false }: SidenavProps) {
    const pathname = usePathname();
    const { isLoggedIn, user } = useAuth();

    const hiddenRoutes = ["/login", "/register"];
    if (hiddenRoutes.includes(pathname)) return null;

    return (
        <aside className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isMobile ? "w-full border-r-0" : (isCollapsed ? "w-16" : "w-64")} ${className}`}>
            {isMobile ? (
                <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border/30 shrink-0">
                    <Link href="/" onClick={onItemClick} className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent font-black text-xl select-none font-sans tracking-tight">
                            PrepNiti
                        </span>
                    </Link>
                </div>
            ) : (
                <div className={`h-14 flex items-center shrink-0 border-b border-transparent ${isCollapsed ? "justify-center" : "px-3"}`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={onToggle} aria-label="Toggle Sidebar">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            )}

            <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto overflow-x-hidden">
                {navLinks.map((link) => {
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    const Icon = link.icon;

                    const LinkContent = (
                        <Link
                            href={link.href}
                            onClick={onItemClick}
                            className={`relative flex items-center ${isCollapsed ? "justify-center" : (isMobile ? "gap-4" : "gap-3")} ${isMobile ? "px-4 py-3.5 text-[15px]" : "px-3 py-3 text-sm"} rounded-xl font-medium transition-all duration-300 group ${isActive
                                ? "text-sidebar-primary-foreground font-semibold"
                                : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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

            {isMobile && <MobileThemeSwitcher />}

            {!isCollapsed && isLoggedIn && user && (
                <div className="p-3 border-t border-sidebar-border/30 shrink-0 flex items-center gap-2.5 overflow-hidden bg-sidebar-accent/30 rounded-xl m-2">
                    <Avatar className="h-8 w-8 border border-sidebar-border/40 shrink-0 shadow-sm animate-in fade-in duration-200">
                        <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary text-[10px] font-extrabold uppercase">
                            {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-xs font-bold text-sidebar-foreground truncate leading-none mb-1">{user.username}</span>
                        <span className="text-[10px] text-sidebar-foreground/50 truncate leading-none">{user.email}</span>
                    </div>
                </div>
            )}
        </aside>
    );
}
