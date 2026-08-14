"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBuddyRecommendations, sendBuddyRequest } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, UserPlus, AlertCircle, Users, Target, MapPin, Zap } from "lucide-react";
import Link from "next/link";

function MatchBadge({ reason }: { reason: string }) {
    if (reason === "same_exam") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 text-[10px] font-medium border border-violet-500/20">
                <Target className="h-2.5 w-2.5" /> Same Goal
            </span>
        );
    }
    if (reason.startsWith("dist:")) {
        const label = reason.replace("dist:", "");
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-medium border border-emerald-500/20">
                <MapPin className="h-2.5 w-2.5" /> {label}
            </span>
        );
    }
    if (reason.endsWith("_mutual")) {
        const count = reason.split("_")[0];
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-medium border border-blue-500/20">
                <Users className="h-2.5 w-2.5" /> {count} Mutual
            </span>
        );
    }
    if (reason === "active") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-medium border border-amber-500/20">
                <Zap className="h-2.5 w-2.5" /> Active This Week
            </span>
        );
    }
    return null;
}

export function BuddyRecommendations() {
    const queryClient = useQueryClient();

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ["buddy-recommendations"],
        queryFn: getBuddyRecommendations,
    });

    const sendRequestMutation = useMutation({
        mutationFn: (target: string) => sendBuddyRequest(target),
        onSuccess: (_, variables) => {
            toast.success("Buddy Request Sent", {
                description: `Request sent to @${variables}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-recommendations"] });
        },
        onError: (err: any) => {
            toast.error("Error Sending Request", {
                description: err.response?.data?.error || "Failed to send buddy request.",
            });
        },
    });

    if (isLoading) {
        return (
            <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        Recommended Study Buddies
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="h-14 bg-muted/40 animate-pulse rounded-xl" />
                    <div className="h-14 bg-muted/40 animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    Recommended Study Buddies
                </CardTitle>
                <CardDescription className="text-[11px]">
                    Personalized matches based on your target exam, proximity &amp; study activity.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4">
                {!recommendations || recommendations.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground/60 text-xs flex flex-col items-center">
                        <AlertCircle className="h-6 w-6 opacity-30 mb-2" />
                        <span className="font-medium">No recommendations right now.</span>
                        <span className="text-[10px] mt-1 max-w-[200px] text-muted-foreground/40">
                            Make sure your target exam and pincode are set in profile settings.
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recommendations.map((rec) => {
                            const initials = rec.username ? rec.username.substring(0, 2).toUpperCase() : "US";
                            const locationSubtitle = [rec.district, rec.state].filter(Boolean).join(", ");
                            const subtitle = [
                                rec.target_exam ? `${rec.target_exam} Aspirant` : "Aspirant",
                                locationSubtitle,
                            ].filter(Boolean).join(" • ");

                            return (
                                <div
                                    key={rec.id}
                                    className="p-3.5 rounded-xl border border-border/30 bg-muted/5 hover:bg-muted/15 transition-all space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar className="h-9 w-9 border border-border/60 shrink-0">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${rec.username}&backgroundColor=6d28d9`} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-[11px] font-bold">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/profile/${rec.username}`}
                                                    className="text-xs font-bold text-foreground hover:text-primary transition-colors block truncate"
                                                >
                                                    @{rec.username}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground truncate block">
                                                    {subtitle}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                sendRequestMutation.mutate(rec.username);
                                            }}
                                            disabled={sendRequestMutation.isPending}
                                            className="h-7 px-3 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shrink-0"
                                        >
                                            <UserPlus className="h-3.5 w-3.5 mr-1" /> Connect
                                        </Button>
                                    </div>

                                    {/* Optional Bio snippet if present */}
                                    {rec.bio && (
                                        <p className="text-[10px] text-muted-foreground/80 line-clamp-1 italic pl-0.5">
                                            "{rec.bio}"
                                        </p>
                                    )}

                                    {/* Match highlight badges */}
                                    {rec.match_reasons && rec.match_reasons.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                            {rec.match_reasons.map((reason, idx) => (
                                                <MatchBadge key={idx} reason={reason} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
