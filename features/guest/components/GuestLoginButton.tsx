"use client";

import { useState } from "react";
import { ENABLE_GUEST_MODE } from "../config";
import { activateGuestSession } from "../guestStorage";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";

export function GuestLoginButton() {
    const [isLoading, setIsLoading] = useState(false);

    if (!ENABLE_GUEST_MODE) return null;

    const handleGuestEntry = () => {
        setIsLoading(true);
        activateGuestSession();
        toast.success("Guest Mode Active", {
            description: "You are exploring PrepNiti in preview mode.",
        });
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        window.location.href = next && next.startsWith("/") ? next : "/";
    };

    return (
        <button
            type="button"
            onClick={handleGuestEntry}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border/50 bg-background/40 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 text-xs font-semibold text-foreground hover:shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            Guest Mode
        </button>
    );
}
