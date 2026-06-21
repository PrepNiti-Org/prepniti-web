"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HeroCTA() {
    const { isLoggedIn, isHydrated } = useAuth();

    if (!isHydrated) {
        return (
            <div className="flex items-center gap-3 pt-2">
                <div className="h-11 w-36 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-5 w-28 rounded bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (isLoggedIn) {
        return (
            <div className="flex items-center gap-3 pt-2">
                <Link href="/tracker">
                    <Button size="lg" className="font-bold px-6 rounded-xl h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        Open planner
                    </Button>
                </Link>
                <Link href="/mock-tests" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Take a mock <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 pt-2">
            <Link href="/register">
                <Button size="lg" className="font-bold px-6 rounded-xl h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Get started free
                </Button>
            </Link>
            <Link href="/mock-tests" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Try a mock test <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}
