"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "../theme/mode-toggle";

import { 
    LogOut, 
    LayoutDashboard, 
    User as UserIcon, 
    Menu, 
    X, 
    PenTool, 
    Sparkles,
    HomeIcon
} from "lucide-react";

const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Tracker", href: "/tracker", icon: LayoutDashboard },
    // { name: "Stories", href: "/stories", icon: BookOpen },
    // { name: "Materials", href: "/materials", icon: GraduationCap },
    // { name: "Community", href: "/community", icon: Users },
];

export function Navbar() {
    const { isLoggedIn, logout, user, isHydrated } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const hiddenRoutes = ["/login", "/register"];
    if (hiddenRoutes.includes(pathname)) return null;

    const avatarUrl = user?.username
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
        : "";
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U";

    const NavItem = ({ name, href, icon: Icon }: { name: string; href: string; icon: React.ElementType }) => {
        const isActive = pathname.startsWith(href);
        return (
            <Link 
                href={href} 
                className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                }`}
            >
                <Icon className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : ""}`} />
                {name}
                {isActive && (
                    <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </Link>
        );
    };

    return (
        <header 
            className={`sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/80 backdrop-blur-md ${
                scrolled ? "shadow-sm" : ""
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
                            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-1 font-bold">
                                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                                PrepNiti
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <NavItem key={link.name} {...link} />
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <ModeToggle />
                        </div>

                        {!isHydrated ? (
                            <div className="w-20 h-9 bg-muted animate-pulse rounded-md hidden sm:block"></div>
                        ) : isLoggedIn ? (
                            <div className="hidden md:flex items-center gap-4">
                                <Link href="/submit">
                                    <Button size="sm" className="gap-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                        <PenTool className="h-4 w-4" /> Share Experience
                                    </Button>
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
                                            <Avatar className="h-9 w-9 border shadow-sm transition-transform hover:scale-105">
                                                <AvatarImage src={avatarUrl} alt={user?.username} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal p-3">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-semibold leading-none truncate">{user?.username}</p>
                                                <p className="text-xs leading-none text-muted-foreground truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href="/tracker"><LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" /> Tracker</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href="/profile"><UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" /> Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Button variant="ghost" asChild className="font-medium">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="rounded-full shadow-sm">
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="md:hidden border-b bg-background/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="px-4 py-6 flex flex-col gap-4">
                            <div className="flex flex-col space-y-2">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname.startsWith(link.href);
                                    return (
                                        <Link 
                                            key={link.name} 
                                            href={link.href}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="h-px bg-border w-full my-2" />

                            {isHydrated && isLoggedIn ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                                        <Avatar className="h-10 w-10 border shadow-sm">
                                            <AvatarImage src={avatarUrl} />
                                            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-semibold truncate">{user?.username}</span>
                                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <Link href="/tracker"><LayoutDashboard className="mr-2 h-4 w-4" /> Tracker</Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
                                        </Button>
                                    </div>
                                    <Button className="w-full gap-2 rounded-full mt-2" asChild>
                                        <Link href="/submit"><PenTool className="h-4 w-4" /> Share Experience</Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-2" onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                    <Button className="w-full" asChild>
                                        <Link href="/register">Sign up</Link>
                                    </Button>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between px-3 py-2 mt-2">
                                <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                                <ModeToggle />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}