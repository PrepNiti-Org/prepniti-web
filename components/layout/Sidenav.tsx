"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BookOpen,
    LayoutDashboard,
    MessagesSquare,
    Sparkles,
    GraduationCap,
    Users2,
    Send,
    PanelLeftClose,
    PanelLeft,
    LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getPendingRequests, getUserProfile } from "@/features/profile/api";
import { SidenavCountdownCard, ExamCountdownModal } from "@/features/countdown";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    showBadge?: boolean;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const navSections: NavSection[] = [
    {
        title: "Workspace",
        items: [
            { name: "Tracker", href: "/tracker", icon: LayoutDashboard, showBadge: false },
            { name: "Mock Tests", href: "/mock-tests", icon: GraduationCap, showBadge: false },
            { name: "Insights", href: "/insights", icon: Sparkles, showBadge: false },
        ]
    },
    {
        title: "Community",
        items: [
            { name: "Experiences", href: "/", icon: BookOpen, showBadge: false },
            { name: "Discussions", href: "/posts", icon: MessagesSquare, showBadge: false },
            { name: "Buddies", href: "/buddies", icon: Users2, showBadge: true },
            { name: "Chat", href: "/chat", icon: Send, showBadge: false },
        ]
    }
];

export const navLinks: NavItem[] = navSections.flatMap(section => section.items);

interface SidenavProps {
    className?: string;
    onItemClick?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    isMobile?: boolean;
}

export function Sidenav({
    className = "",
    onItemClick,
    isCollapsed = false,
    onToggle,
    isMobile = false
}: SidenavProps) {
    const pathname = usePathname();
    const { isLoggedIn, user: authUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: profileUser } = useQuery({
        queryKey: ["profile"],
        queryFn: getUserProfile,
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5,
    });
    const user = profileUser || authUser;

    const { data: buddyRequests } = useQuery({
        queryKey: ["buddy-requests"],
        queryFn: getPendingRequests,
        enabled: isLoggedIn,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
    const incomingCount = buddyRequests?.incoming?.length ?? 0;

    const hiddenRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    if (hiddenRoutes.includes(pathname)) return null;

    return (
        <>
            <aside
                data-tour="sidenav-container"
                className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 select-none ${
                    isMobile ? "w-full border-r-0" : isCollapsed ? "w-16" : "w-60"
                } ${className}`}
            >
                {!isMobile && (
                    <div className={`h-10 flex items-center shrink-0 px-3 border-b border-sidebar-border/40 ${isCollapsed ? "justify-center" : "justify-end"}`}>

                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
                                        onClick={onToggle}
                                        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                                    >
                                        {isCollapsed ? (
                                            <PanelLeft className="h-4 w-4" />
                                        ) : (
                                            <PanelLeftClose className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side={isCollapsed ? "right" : "bottom"} className="text-xs font-medium">
                                    <span>{isCollapsed ? "Expand" : "Collapse"}</span>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                <SidenavCountdownCard
                    user={user}
                    isCollapsed={isCollapsed}
                    onClick={() => setIsModalOpen(true)}
                />

                <div className="flex-1 py-2 px-2.5 space-y-4 overflow-y-auto no-scrollbar overflow-x-hidden">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {!isCollapsed && (
                                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sidebar-foreground/45">
                                    {section.title}
                                </div>
                            )}

                            <div className="space-y-0.5">
                                {section.items.map((link) => {
                                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                                    const Icon = link.icon;
                                    const badgeCount = link.showBadge ? incomingCount : 0;
                                    const tourId = `nav-${link.href.replace("/", "") || "experiences"}`;

                                    const LinkContent = (
                                        <Link
                                            href={link.href}
                                            onClick={onItemClick}
                                            data-tour={tourId}
                                            className={`relative flex items-center ${
                                                isCollapsed
                                                    ? "justify-center h-10 w-10 mx-auto"
                                                    : "gap-3 px-3 py-2.5 text-sm"
                                            } rounded-xl font-medium transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary ${
                                                isActive
                                                    ? "text-sidebar-primary font-bold bg-sidebar-accent/80 border border-sidebar-border shadow-xs"
                                                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                            }`}
                                        >
                                            <span className="relative z-10 shrink-0 flex items-center justify-center">
                                                <Icon
                                                    className={`h-4.5 w-4.5 transition-transform duration-200 ${
                                                        isActive ? "scale-105 text-sidebar-primary" : "group-hover:scale-105"
                                                    }`}
                                                />
                                                {isCollapsed && badgeCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sidebar" />
                                                )}
                                            </span>

                                            <AnimatePresence initial={false}>
                                                {!isCollapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="relative z-10 whitespace-nowrap overflow-hidden flex-1 flex items-center justify-between text-[13.5px] tracking-tight"
                                                    >
                                                        <span className="truncate">{link.name}</span>
                                                        {badgeCount > 0 && (
                                                            <span className="ml-2 h-4 min-w-4 px-1.5 text-[9px] font-black bg-red-500 text-white rounded-full flex items-center justify-center leading-none shadow-sm ring-1 ring-white/20">
                                                                {badgeCount > 9 ? "9+" : badgeCount}
                                                            </span>
                                                        )}
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
                                                    <TooltipContent side="right" sideOffset={10} className="flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl">
                                                        <span>{link.name}</span>
                                                        {badgeCount > 0 && (
                                                            <span className="h-4 min-w-4 px-1 text-[9px] font-black bg-red-500 text-white rounded-full flex items-center justify-center leading-none">
                                                                {badgeCount > 9 ? "9+" : badgeCount}
                                                            </span>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        );
                                    }

                                    return <div key={link.name}>{LinkContent}</div>;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <ExamCountdownModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                userProfile={user}
            />
        </>
    );
}
