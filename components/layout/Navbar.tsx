"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserProfile } from "@/features/profile/api";

import { Search, PenTool, User as UserIcon, LogOut, Bookmark, HelpCircle, ChevronRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "../theme/mode-toggle";
import { NotificationBell } from "../notifications/NotificationBell";
import { NavbarTimer } from "../timer/NavbarTimer";
import { useAppTour } from "@/features/tour/useAppTour";

export function Navbar() {
    const { isLoggedIn, logout, user: authUser, isHydrated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const { startTour } = useAppTour();

    const { data: profileUser } = useQuery({
        queryKey: ["profile"],
        queryFn: getUserProfile,
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5,
    });

    const user = profileUser || authUser;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    };

    const hiddenRoutes = ["/login", "/register"];
    if (hiddenRoutes.includes(pathname)) return null;

    const avatarUrl = user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : "";
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U";

    const missingFields: string[] = [];
    if (!user?.target_exam) missingFields.push("Target Exam");
    if (!user?.pincode && !user?.district) missingFields.push("Location / Pincode");
    if (!user?.bio?.trim()) missingFields.push("Bio");

    const completionScore = [
        Boolean(user?.username),
        Boolean(user?.email),
        Boolean(user?.target_exam),
        Boolean(user?.bio?.trim()),
        Boolean(user?.pincode || user?.district),
    ].filter(Boolean).length;
    const completionPct = (completionScore / 5) * 100;

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/90 backdrop-blur-xl h-14 flex items-center shadow-sm">
            <div className="w-full mx-4 flex items-center justify-between gap-4">

                {/* Left Section: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                        <div className="relative w-7 h-7 shrink-0 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logo.svg"
                                alt="PrepNiti Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="bg-linear-to-r from-primary via-primary/90 to-orange-400 bg-clip-text text-transparent items-center gap-1.5 font-extrabold hidden sm:flex">
                            PrepNiti
                        </span>
                    </Link>
                </div>

                <div className="flex max-w-xl w-full mx-auto">
                    <form onSubmit={handleSearchSubmit} className="flex-1 px-2 md:px-6" data-tour="navbar-search">
                        <div className="relative group">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search discussions, experiences..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 bg-primary/10 text-foreground border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 rounded-full text-sm"
                            />
                        </div>
                    </form>
                    <div data-tour="navbar-timer" className="shrink-0 flex items-center">
                        <NavbarTimer />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div data-tour="navbar-theme">
                        <ModeToggle />
                    </div>

                    {!isHydrated ? (
                        <div className="w-9 h-9 bg-muted animate-pulse rounded-full hidden sm:block"></div>
                    ) : isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {/* <Link href="/posts/create" className="hidden md:flex" data-tour="navbar-post">
                                <ElevatedButton variant="primary" size="sm" className="btn-elevated" style={{ "--btn-shadow-color": "hsl(15 100% 38%)" } as React.CSSProperties}>
                                    <PenTool className="h-3.5 w-3.5" /> Post
                                </ElevatedButton>
                            </Link> */}

                            <div data-tour="navbar-notifications">
                                <NotificationBell />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        data-tour="navbar-profile"
                                        className="relative w-9 h-9 p-0 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        title={
                                            missingFields.length > 0
                                                ? `Profile ${Math.round(completionPct)}% complete (Missing: ${missingFields.join(", ")})`
                                                : "Profile 100% complete"
                                        }
                                    >
                                        {completionPct < 100 && (
                                            <svg
                                                className="absolute inset-0 w-full h-full pointer-events-none"
                                                viewBox="0 0 36 36"
                                                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                                            >
                                                <circle
                                                    cx="18"
                                                    cy="18"
                                                    r="16"
                                                    fill="none"
                                                    className="stroke-muted-foreground/20"
                                                    strokeWidth="2"
                                                />
                                                <circle
                                                    cx="18"
                                                    cy="18"
                                                    r="16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeDasharray={100.53}
                                                    strokeDashoffset={100.53 * (1 - completionPct / 100)}
                                                    strokeLinecap="round"
                                                    className="text-primary transition-all duration-700 ease-out"
                                                />
                                            </svg>
                                        )}
                                        <Avatar className={completionPct < 100 ? "h-7 w-7 shrink-0" : "h-8 w-8 border shrink-0"}>
                                            <AvatarImage src={avatarUrl} alt={user?.username} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-64 p-1.5 shadow-2xl border-border/80 bg-popover/95 backdrop-blur-xl rounded-2xl" align="end" forceMount>
                                    <div className="flex items-center gap-3 p-2.5">
                                        <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                                            <AvatarImage src={avatarUrl} alt={user?.username} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">@{user?.username}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                    </div>

                                    {missingFields.length > 0 && (
                                        <Link
                                            href="/profile"
                                            className="mx-1 my-1 p-2.5 rounded-xl bg-primary/6 hover:bg-primary/12 border border-primary/15 transition-all flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="space-y-0.5 min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                                                    <span className="font-bold text-[11px] text-foreground">
                                                        Profile {Math.round(completionPct)}% Complete
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    Add {missingFields.slice(0, 2).join(" & ")} for better matches
                                                </p>
                                            </div>
                                            <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    )}

                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                                        <Link href="/bookmarks"><Bookmark className="mr-2 h-4 w-4 text-muted-foreground" /> Bookmarks</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                                        <Link href="/profile"><UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg md:hidden">
                                        <Link href="/posts/create"><PenTool className="mr-2 h-4 w-4 text-muted-foreground" /> Create Post</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => startTour(0)} className="cursor-pointer rounded-lg text-primary font-semibold">
                                        <Sparkles className="mr-2 h-4 w-4 text-primary" /> Take App Tour
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                            <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Help & Legal</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="w-48">
                                                <DropdownMenuItem onClick={() => startTour(0)} className="cursor-pointer">
                                                    <Compass className="mr-2 h-4 w-4 text-primary" /> Restart Walkthrough
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href="/about">About PrepNiti</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href="/feedback">Send Feedback</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href="/privacy">Privacy Policy</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href="/terms">Terms of Service</Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="hidden sm:flex font-medium">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button size="sm" asChild className="rounded-full shadow-sm">
                                <Link href="/register">Sign up</Link>
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}