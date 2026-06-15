"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import Link from "next/link";
import { Target, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    if (!token) {
        return (
            <div className="text-center space-y-3 py-2">
                <p className="text-sm text-destructive font-semibold">
                    Error: Missing or invalid password reset token.
                </p>
                <Link href="/forgot-password" className="inline-block text-xs font-bold text-primary hover:underline underline-offset-4">
                    Request a new reset link
                </Link>
            </div>
        );
    }

    return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full min-h-screen lg:h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="hidden bg-muted/20 border-r border-border/40 lg:flex flex-col justify-between p-12 text-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-full blur-[80px] opacity-70 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

                <div className="flex items-center gap-2 relative z-10">
                    <div className="bg-primary/10 border border-primary/20 p-2 rounded-2xl">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        PrepNiti
                    </span>
                </div>

                <div className="space-y-8 relative z-10 max-w-lg my-auto">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                            <Sparkles className="h-3 w-3" /> Anonymous & Secure Prep Space
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-[1.15] text-foreground">
                            Update Your <br />
                            Password.
                        </h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            Create a strong, unique password to secure your account. Once updated, you can log in immediately with your new credentials.
                        </p>
                    </div>

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
                                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" /> Free
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">No Paywalls</p>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground/60 relative z-10">
                    © 2026 PrepNiti. Built by aspirants, for aspirants.
                </div>
            </div>

            <div className="flex items-center justify-center p-8 sm:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mx-auto w-full max-w-[380px] space-y-6"
                >
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Update password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a secure password containing numbers and symbols.
                        </p>
                    </div>

                    <div className="bg-card/45 backdrop-blur-xl border border-border/80 p-6 rounded-2xl shadow-xl">
                        <Suspense fallback={<div className="text-center py-4 text-xs text-muted-foreground">Extracting security credentials...</div>}>
                            <ResetPasswordContent />
                        </Suspense>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Back to{" "}
                        <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
