"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Terminal } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 space-y-6">
      <div className="relative border border-destructive/25 rounded-3xl p-8 md:p-12 text-center space-y-6 overflow-hidden shadow-lg shadow-destructive/5 bg-gradient-to-b from-destructive/10 via-destructive/[0.02] to-transparent">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-full text-destructive border border-destructive/20 shadow-inner">
            <AlertTriangle className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/85">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              An unexpected error occurred while rendering this page. The system administrator has been notified.
            </p>
          </div>

          {/* Diagnostic Log */}
          <div className="w-full max-w-md bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl p-4 text-left font-mono text-xs text-muted-foreground overflow-x-auto relative">
            <div className="flex items-center gap-2 mb-2 text-foreground/70 font-semibold border-b border-border/40 pb-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Error Details</span>
            </div>
            <p className="font-semibold text-destructive/90 select-all">
              Error: {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="mt-1 text-[10px] text-muted-foreground/80 select-all">
                Reference ID: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button onClick={() => reset()} className="font-semibold shadow-md transition-all cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="bg-background shadow-sm hover:bg-muted/50 transition-all cursor-pointer"
            >
              Reload Page
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                className="hover:bg-muted/50 transition-all cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" /> Home Feed
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
