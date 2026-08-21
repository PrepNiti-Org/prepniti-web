"use client";

import { isValid, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, ChevronRight } from "lucide-react";
import { UserProfile } from "@/features/profile/api";
import { User } from "@/features/auth/hooks/useAuth";
import { useTargetCountdown } from "../hooks/useTargetCountdown";

interface SidenavCountdownCardProps {
    user?: UserProfile | User | null;
    isCollapsed?: boolean;
    onClick: () => void;
}

export function SidenavCountdownCard({
    user,
    isCollapsed = false,
    onClick,
}: SidenavCountdownCardProps) {
    const { activeTarget, daysRemaining, wallpaper } = useTargetCountdown(user);

    if (isCollapsed) {
        return (
            <div className="py-2 flex justify-center">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={onClick}
                                className="h-10 w-10 rounded-xl relative overflow-hidden border border-sidebar-border flex items-center justify-center cursor-pointer text-primary shadow-xs hover:border-primary/50 transition-all text-white group"
                                aria-label="Target Exam Countdown"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${wallpaper.url}')` }}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />

                                <div className="relative z-10 flex items-center justify-center">
                                    {activeTarget && daysRemaining !== null ? (
                                        <span className="text-sm font-black font-mono leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">
                                            {daysRemaining}
                                        </span>
                                    ) : (
                                        <Target className="h-4.5 w-4.5 text-white drop-shadow-md" />
                                    )}
                                </div>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10} className="text-xs font-bold">
                            {activeTarget && daysRemaining !== null ? (
                                <span>{daysRemaining} days remaining for {activeTarget.name}</span>
                            ) : (
                                <span>Set Target Exam</span>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className="px-2.5 pt-2 pb-0.5">
            <button
                type="button"
                onClick={onClick}
                aria-label={activeTarget ? `Countdown: ${daysRemaining} days remaining for ${activeTarget.name}` : "Set Target Exam"}
                className="w-full relative overflow-hidden rounded-xl p-3 text-left transition-all duration-300 group cursor-pointer border border-sidebar-border/80 hover:border-primary/50 shadow-xs text-white"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${wallpaper.url}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 group-hover:from-black/70 group-hover:via-black/25 transition-colors" />

                {activeTarget && daysRemaining !== null ? (
                    <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1 shrink-0">
                            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                                {daysRemaining}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                days
                            </span>
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                            <div className="text-[11.5px] font-bold text-white truncate leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                {activeTarget.name}
                            </div>
                            <div className="text-[9.5px] text-white/80 font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5">
                                {isValid(activeTarget.date) ? format(activeTarget.date, "dd MMM yyyy") : ""}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex items-center justify-between py-0.5">
                        <div>
                            <div className="text-[11.5px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                                Set Target Exam
                            </div>
                            <p className="text-[9.5px] text-white/80 font-medium leading-none mt-0.5 drop-shadow-md">
                                Start countdown
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                )}
            </button>
        </div>
    );
}
