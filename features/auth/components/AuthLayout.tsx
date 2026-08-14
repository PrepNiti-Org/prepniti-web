"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface AuthLayoutProps {
    sidebarTitle: React.ReactNode;
    sidebarBody: string;
    pageTitle: string;
    pageSubtitle: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

export function AuthLayout({
    sidebarTitle,
    sidebarBody,
    pageTitle,
    pageSubtitle,
    footer,
    children,
}: AuthLayoutProps) {
    return (
        <div className="w-full min-h-screen lg:h-screen grid lg:grid-cols-2 bg-background relative overflow-y-auto no-scrollbar overflow-x-hidden lg:overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[130px] pointer-events-none animate-blob-one" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[130px] pointer-events-none animate-blob-two" />

            {/* Left sidebar pane (Hidden on mobile) */}
            <div className="hidden bg-muted/20 border-r border-border/40 lg:flex flex-col justify-between lg:py-8 lg:px-10 xl:p-12 text-foreground relative overflow-y-auto no-scrollbar">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-[80px] opacity-70 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Logo / Header */}
                <div className="flex items-center gap-2.5 relative z-10">
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                            src="/logo.svg"
                            alt="PrepNiti Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary via-primary/90 to-orange-400 bg-clip-text text-transparent">
                        PrepNiti
                    </span>
                </div>

                {/* Core Marketing info */}
                <div className="space-y-6 relative z-10 max-w-lg my-auto">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                            <Sparkles className="h-3 w-3 animate-pulse" /> Anonymous & Secure Prep Space
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-[1.15] text-foreground">
                            {sidebarTitle}
                        </h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {sidebarBody}
                        </p>
                    </div>

                    {/* Mini Dashboard Preview Widget */}
                    <div className="bg-card/45 backdrop-blur-xl border border-white/10 dark:border-white/5 p-5 rounded-2xl shadow-xl space-y-4 max-w-sm mt-4 select-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Checklist & Tracker</span>
                            <span className="text-[9px] font-bold bg-primary/15 border border-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-background/50 border border-border/40 hover:border-primary/20 transition-all duration-300">
                                <div className="w-4 h-4 rounded-md border border-primary/45 bg-primary/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-sm bg-primary" />
                                </div>
                                <span className="text-xs font-semibold text-foreground/90">Revise UPSC polity notes</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-background/50 border border-border/40">
                                <div className="w-4 h-4 rounded-md border border-border/80 flex items-center justify-center" />
                                <span className="text-xs font-medium text-muted-foreground">Practice Bank Mock Test #4</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-muted-foreground/60">
                            <span>Consistency Streak</span>
                            <span className="text-primary flex items-center gap-1">🔥 12 Days</span>
                        </div>
                        {/* Fake calendar grid for streak */}
                        <div className="grid grid-cols-7 gap-1 pt-1">
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2.5 rounded-[3px] transition-all duration-300 ${
                                        i < 12 
                                            ? "bg-primary/80 shadow-[0_0_8px_var(--primary)]" 
                                            : "bg-muted/80"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer copyright */}
                <div className="text-xs text-muted-foreground/60 relative z-10">
                    © 2026 PrepNiti. Built by aspirants, for aspirants.
                </div>
            </div>

            {/* Right form pane */}
            <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 lg:h-full lg:overflow-y-auto no-scrollbar">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mx-auto w-full max-w-[390px] space-y-4 sm:space-y-6"
                >
                    <div className="flex flex-col space-y-1 sm:space-y-2 text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            {pageTitle}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {pageSubtitle}
                        </p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-5 sm:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(234,129,53,0.03)] transition-all duration-300">
                        {children}
                    </div>

                    {footer && (
                        <p className="text-center text-xs text-muted-foreground">
                            {footer}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
