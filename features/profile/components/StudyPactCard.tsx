"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Swords, Trophy, Flame, X, Clock, CheckCircle2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { StudyPact, cancelPact } from "@/features/profile/pact_api";
import { PactProgressEntry } from "@/features/profile/pact_api";
import Link from "next/link";

interface StudyPactCardProps {
    pact: StudyPact;
    currentUsername?: string;
}

function RadialProgress({ value, max, size = 56 }: { value: number; max: number; size?: number }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="currentColor"
                strokeWidth={5}
                className="text-muted/30"
            />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                className={pct >= 100 ? "text-emerald-500" : "text-primary"}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
        </svg>
    );
}

function ParticipantProgress({ entry, isSelf }: { entry: PactProgressEntry; isSelf: boolean }) {
    const initials = entry.username.substring(0, 2).toUpperCase();
    const todayPct = entry.goal_mins > 0 ? Math.min(100, (entry.today_mins / entry.goal_mins) * 100) : 0;
    const completionRate = entry.days_passed > 0 ? Math.round((entry.days_completed / entry.days_passed) * 100) : 0;
    const goalMet = entry.today_mins >= entry.goal_mins;

    return (
        <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${isSelf ? "border-primary/20 bg-primary/5" : "border-border/30 bg-muted/5"}`}>
            <div className="relative">
                <RadialProgress value={entry.today_mins} max={entry.goal_mins} size={60} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-7 w-7 border border-border/50">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}&backgroundColor=6d28d9`} />
                        <AvatarFallback className="text-[9px] font-black bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="text-center min-w-0 w-full">
                <Link href={`/profile/${entry.username}`} className="text-xs font-black text-foreground hover:text-primary truncate block">
                    {isSelf ? "You" : `@${entry.username}`}
                </Link>
                <p className={`text-[10px] font-bold mt-0.5 ${goalMet ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {entry.today_mins}m / {entry.goal_mins}m today
                </p>
                {goalMet && <CheckCircle2 className="h-3 w-3 text-emerald-500 mx-auto mt-0.5" />}
            </div>

            <div className="w-full space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">Goal streak</span>
                    <span className="text-[9px] font-black text-foreground">{entry.days_completed}/{entry.days_passed}d</span>
                </div>
                <Progress value={completionRate} className="h-1" />
            </div>
        </div>
    );
}

const statusConfig = {
    active: { label: "Active", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: Flame },
    completed: { label: "Completed", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Trophy },
    cancelled: { label: "Cancelled", color: "bg-muted/30 text-muted-foreground border-border/50", icon: X },
    broken_by_initiator: { label: "Broken", color: "bg-red-500/15 text-red-600 border-red-500/30", icon: X },
    broken_by_partner: { label: "Broken", color: "bg-red-500/15 text-red-600 border-red-500/30", icon: X },
};

export function StudyPactCard({ pact, currentUsername }: StudyPactCardProps) {
    const queryClient = useQueryClient();
    const config = statusConfig[pact.status] ?? statusConfig.active;
    const StatusIcon = config.icon;

    const daysLeft = Math.max(0, pact.duration_days - (pact.initiator.days_passed));
    const overallProgress = pact.duration_days > 0
        ? Math.min(100, ((pact.initiator.days_passed) / pact.duration_days) * 100)
        : 0;

    const isMeInitiator = pact.initiator.username === currentUsername;
    const me = isMeInitiator ? pact.initiator : pact.partner;
    const them = isMeInitiator ? pact.partner : pact.initiator;

    const cancelMutation = useMutation({
        mutationFn: () => cancelPact(pact.id),
        onSuccess: () => {
            toast.success("Pact cancelled");
            queryClient.invalidateQueries({ queryKey: ["my-pacts"] });
        },
        onError: () => toast.error("Failed to cancel pact"),
    });

    return (
        <Card className={`overflow-hidden border ${pact.status === "active" ? "border-primary/20 bg-primary/3" : "border-border/40"}`}>
            <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Swords className="h-4 w-4 text-primary shrink-0" />
                        <CardTitle className="text-sm font-black">
                            Study Pact vs @{them.username}
                        </CardTitle>
                    </div>
                    <Badge className={`text-[9px] font-bold border shrink-0 ${config.color}`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {config.label}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {pact.duration_days}d pact
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pact.daily_goal_mins}m/day goal
                    </span>
                    {pact.status === "active" && (
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Flame className="h-3 w-3" />
                            {daysLeft}d left
                        </span>
                    )}
                </div>

                <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>Pact progress</span>
                        <span className="font-bold">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress
                        value={overallProgress}
                        className={`h-1.5 ${pact.status === "completed" ? "[&>div]:bg-amber-500" : ""}`}
                    />
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                    <ParticipantProgress entry={me} isSelf={true} />
                    <ParticipantProgress entry={them} isSelf={false} />
                </div>

                {pact.status === "active" && (
                    <div className="mt-3 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelMutation.mutate()}
                            disabled={cancelMutation.isPending}
                            className="h-6 text-[10px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancel pact
                        </Button>
                    </div>
                )}

                <p className="text-[9px] text-muted-foreground mt-2 text-right">
                    Started {formatDistanceToNow(new Date(pact.start_date), { addSuffix: true })}
                </p>
            </CardContent>
        </Card>
    );
}
