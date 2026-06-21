"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
    invalid_state: "Security check failed. Please try signing in again.",
    missing_code: "Authorization code missing. Please try again.",
    token_exchange_failed: "Could not connect to Google. Please try again.",
    userinfo_fetch_failed: "Could not fetch your Google profile. Please try again.",
    userinfo_parse_failed: "Could not read your Google profile. Please try again.",
    sso_failed: "Sign-in failed. Please try again or use email and password.",
    default: "An unexpected error occurred. Please try again.",
};

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (success === "true") {
            setStatus("success");
            // Short delay so the user sees the success state
            const timer = setTimeout(() => {
                router.replace("/");
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (error) {
            setStatus("error");
            setErrorMessage(ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default);
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center gap-5 text-center max-w-sm px-6"
            >
                {status === "loading" && (
                    <>
                        <div className="relative">
                            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Loader2 className="h-7 w-7 text-primary animate-spin" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                        </div>
                        <div className="space-y-1.5">
                            <h1 className="text-lg font-black tracking-tight text-foreground">
                                Signing you in…
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Setting up your session, please wait.
                            </p>
                        </div>
                    </>
                )}

                {status === "success" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                        >
                            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </motion.div>
                        <div className="space-y-1.5">
                            <h1 className="text-lg font-black tracking-tight text-foreground">
                                Signed in!
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Redirecting to your dashboard…
                            </p>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="h-14 w-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center"
                        >
                            <XCircle className="h-7 w-7 text-destructive" />
                        </motion.div>
                        <div className="space-y-1.5">
                            <h1 className="text-lg font-black tracking-tight text-foreground">
                                Sign-in failed
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {errorMessage}
                            </p>
                        </div>
                        <button
                            onClick={() => router.replace("/login")}
                            className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
