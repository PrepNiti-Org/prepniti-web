"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { Menu, Search, PenTool, LayoutDashboard, User as UserIcon, LogOut, Bookmark, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "../theme/mode-toggle";
import { Sidenav } from "./Sidenav";
import { ElevatedButton } from "../ui/button-elevated";
import { NotificationBell } from "../notifications/NotificationBell";
import { NavbarTimer } from "../timer/NavbarTimer";

interface NavbarProps {
    // onToggleSidebar not needed anymore since Desktop toggle is in Sidenav
}

export function Navbar({ }: NavbarProps) {
    const { isLoggedIn, logout, user, isHydrated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileOpen(false);
    }, [pathname]);

    const hiddenRoutes = ["/login", "/register"];
    if (hiddenRoutes.includes(pathname)) return null;

    const avatarUrl = user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : "";
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U";

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/90 backdrop-blur-xl h-14 flex items-center shadow-sm">
            <div className="w-full mx-4 flex items-center justify-between gap-4">

                {/* Left Section: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                        <div className="relative w-7 h-7 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logo.svg"
                                alt="PrepNiti Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="bg-gradient-to-r from-primary via-primary/90 to-orange-400 bg-clip-text text-transparent items-center gap-1.5 font-extrabold hidden sm:flex">
                            PrepNiti
                        </span>
                    </Link>
                </div>

                <div className="flex max-w-xl w-full mx-auto">
                    <form onSubmit={handleSearchSubmit} className="flex-1 px-2 md:px-6">
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
                    <NavbarTimer />
                </div>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <ModeToggle />

                    {!isHydrated ? (
                        <div className="w-9 h-9 bg-muted animate-pulse rounded-full hidden sm:block"></div>
                    ) : isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Link href="/posts/create" className="hidden md:flex">
                                <ElevatedButton variant="primary" size="sm" className="btn-elevated" style={{ "--btn-shadow-color": "hsl(15 100% 38%)" } as React.CSSProperties}>
                                    <PenTool className="h-3.5 w-3.5" /> Post
                                </ElevatedButton>
                            </Link>

                            <NotificationBell />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary p-0">
                                        <Avatar className="h-9 w-9 border shadow-sm transition-transform hover:scale-105">
                                            <AvatarImage src={avatarUrl} alt={user?.username} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56 shadow-2xl border-border/80 bg-popover/95 backdrop-blur-md" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none truncate">{user?.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/bookmarks"><Bookmark className="mr-2 h-4 w-4 text-muted-foreground" /> Bookmarks</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile"><UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                                        <Link href="/posts/create"><PenTool className="mr-2 h-4 w-4 text-muted-foreground" /> Create Post</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                            <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Help & Legal</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="w-48">
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