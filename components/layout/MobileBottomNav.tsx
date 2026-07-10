"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./Sidenav";
import { motion } from "framer-motion";

export function MobileBottomNav() {
    const pathname = usePathname();

    const hiddenRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    if (hiddenRoutes.includes(pathname)) return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar/85 backdrop-blur-[32px] backdrop-saturate-[200%] border-t border-sidebar-border safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sidebar-foreground/10 to-transparent" />

            <div className="flex items-center justify-around h-16 px-1 relative">
                {navLinks.map((link) => {
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
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
            </div>
        </nav>
    );
}
