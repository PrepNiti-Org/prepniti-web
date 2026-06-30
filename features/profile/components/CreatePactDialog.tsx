"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, Clock, CalendarDays, Target } from "lucide-react";
import { toast } from "sonner";
import { createPact } from "@/features/profile/pact_api";

interface CreatePactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    buddyUsername: string;
}

const DURATION_OPTIONS = [7, 14, 21, 30, 60, 90];

export function CreatePactDialog({ open, onOpenChange, buddyUsername }: CreatePactDialogProps) {
    const queryClient = useQueryClient();
    const [durationDays, setDurationDays] = useState(30);
    const [dailyGoalMins, setDailyGoalMins] = useState(120);

    const createMutation = useMutation({
        mutationFn: () =>
            createPact({
                partner_username: buddyUsername,
                duration_days: durationDays,
                daily_goal_mins: dailyGoalMins,
            }),
        onSuccess: () => {
            toast.success(`Study pact with @${buddyUsername} created!`);
            queryClient.invalidateQueries({ queryKey: ["my-pacts"] });
            onOpenChange(false);
        },
        onError: (err: Error) => toast.error(err.message || "Failed to create pact"),
    });

    const initials = buddyUsername.substring(0, 2).toUpperCase();

    const formatGoal = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Swords className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-black">Challenge a Buddy</DialogTitle>
                            <DialogDescription className="text-xs">
                                Create a formal study accountability pact
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/5">
                    <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${buddyUsername}&backgroundColor=6d28d9`} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-black">@{buddyUsername}</p>
                        <p className="text-[11px] text-muted-foreground">Your accountability partner</p>
                    </div>
                    <Swords className="h-4 w-4 text-primary ml-auto" />
                </div>

                <div className="space-y-5">
                    <div className="space-y-3">
                        <Label className="text-xs font-black flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                            Duration
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                            {DURATION_OPTIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDurationDays(d)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${durationDays === d
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted/20 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                        }`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            Daily Study Goal
                            <span className="ml-auto text-primary font-black">{formatGoal(dailyGoalMins)}</span>
                        </Label>
                        <Slider
                            min={15}
                            max={720}
                            step={15}
                            value={[dailyGoalMins]}
                            onValueChange={([v]: number[]) => setDailyGoalMins(v)}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>15m</span>
                            <span>2h</span>
                            <span>4h</span>
                            <span>6h</span>
                            <span>12h</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                        <p className="text-[10px] font-black text-primary flex items-center gap-1">
                            <Target className="h-3 w-3" /> Pact Summary
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Both you and <span className="font-bold text-foreground">@{buddyUsername}</span> commit to studying{" "}
                            <span className="font-bold text-primary">{formatGoal(dailyGoalMins)}</span> daily for{" "}
                            <span className="font-bold text-primary">{durationDays} days</span>.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-xs">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                        className="text-xs font-black"
                    >
                        <Swords className="h-3.5 w-3.5 mr-1.5" />
                        {createMutation.isPending ? "Creating..." : "Start Pact"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
