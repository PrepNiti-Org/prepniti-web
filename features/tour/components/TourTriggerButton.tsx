"use client";

import React from "react";
import { Sparkles, Compass } from "lucide-react";
import { useAppTour } from "../useAppTour";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TourTriggerButtonProps {
    variant?: "navbar-icon" | "navbar-chip" | "dropdown-item";
    className?: string;
}

export function TourTriggerButton({ variant = "navbar-icon", className = "" }: TourTriggerButtonProps) {
    const { startTour } = useAppTour();

    if (variant === "dropdown-item") {
        return (
            <button
                onClick={() => startTour(0)}
                className={`w-full flex items-center px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer text-left ${className}`}
            >
                <Compass className="mr-2 h-4 w-4 text-primary" />
                <span className="font-semibold">Take Product Tour</span>
            </button>
        );
    }

    if (variant === "navbar-chip") {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => startTour(0)}
                className={`h-8 px-2.5 rounded-full border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs gap-1.5 shadow-sm group ${className}`}
                title="Start App Walkaround"
            >
                <Sparkles className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                <span>Tour</span>
            </Button>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => startTour(0)}
                        aria-label="Take Product Tour"
                        className={`relative h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border border-border/50 hover:border-primary/30 ${className}`}
                    >
                        <Compass className="h-4 w-4 text-primary" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">
                    Take App Walkthrough
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
