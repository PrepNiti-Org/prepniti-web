"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBuddyRecommendations, sendBuddyRequest } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, UserPlus, AlertCircle, Users } from "lucide-react";
import Link from "next/link";

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
                        People You May Know
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="h-10 bg-muted/40 animate-pulse rounded-xl" />
                    <div className="h-10 bg-muted/40 animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    People You May Know
                </CardTitle>
                <CardDescription className="text-[10px]">Graph recommendations based on second-degree mutual buddies.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4">
                {!recommendations || recommendations.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground/60 text-xs flex flex-col items-center">
                        <AlertCircle className="h-6 w-6 opacity-30 mb-2" />
                        <span>No recommendations available yet.</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => {
                            const initials = rec.username ? rec.username.substring(0, 2).toUpperCase() : "US";
                            return (
                                <div key={rec.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/20 bg-muted/5 hover:bg-muted/10 transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${rec.username}&backgroundColor=6d28d9`} />
                                            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-black">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <Link href={`/profile/${rec.username}`} className="text-xs font-black text-foreground hover:text-primary block truncate">
                                                @{rec.username}
                                            </Link>
                                            <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {rec.mutual_count} mutual buddy{rec.mutual_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            sendRequestMutation.mutate(rec.username);
                                        }}
                                        disabled={sendRequestMutation.isPending}
                                        className="h-7 text-[10px] font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shrink-0"
                                    >
                                        <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
