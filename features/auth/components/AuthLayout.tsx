"use client";

import { Target, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="w-full min-h-screen lg:h-screen grid lg:grid-cols-2 bg-background relative overflow-y-auto no-scrollbar overflow-x-hidden lg:overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Left sidebar pane (Hidden on mobile) */}
            <div className="hidden bg-muted/20 border-r border-border/40 lg:flex flex-col justify-between p-12 text-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-full blur-[80px] opacity-70 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Logo / Header */}
                <div className="flex items-center gap-2 relative z-10">
                    <div className="bg-primary/10 border border-primary/20 p-2 rounded-2xl">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        PrepNiti
                    </span>
                </div>

                {/* Core Marketing info */}
                <div className="space-y-8 relative z-10 max-w-lg my-auto">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                            <Sparkles className="h-3 w-3" /> Anonymous & Secure Prep Space
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-[1.15] text-foreground">
                            {sidebarTitle}
                        </h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {sidebarBody}
                        </p>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-8">
                        <div className="space-y-1">
                            <div className="text-xl font-black tracking-tight text-foreground flex items-center gap-1">
                                <Shield className="h-4 w-4 text-primary shrink-0" /> 100%
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Private & Secure</p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl font-black tracking-tight text-foreground flex items-center gap-1">
                                <Target className="h-4 w-4 text-violet-500 shrink-0" /> Dynamic
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Study Tracker</p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl font-black tracking-tight text-foreground flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" /> Interactive
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Mock Exams</p>
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
                    className="mx-auto w-full max-w-[380px] space-y-4 sm:space-y-6"
                >
                    <div className="flex flex-col space-y-1 sm:space-y-2 text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            {pageTitle}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {pageSubtitle}
                        </p>
                    </div>

                    <div className="bg-card/45 backdrop-blur-xl border border-border/80 p-4 sm:p-6 rounded-2xl shadow-xl">
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
