"use client";

import { useQuery } from "@tanstack/react-query";
import { getBuddyProgressFeed } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Trophy, Check } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function BuddyActivityFeed() {
    const { data: feed, isLoading } = useQuery({
        queryKey: ["buddy-feed"],
        queryFn: getBuddyProgressFeed,
    });

    if (isLoading) {
        return (
            <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Buddy Study Activity Feed
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="h-16 bg-muted/40 animate-pulse rounded-xl" />
                    <div className="h-16 bg-muted/40 animate-pulse rounded-xl" />
                    <div className="h-16 bg-muted/40 animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Buddy Study Activity Feed
                </CardTitle>
                <CardDescription className="text-xs">Real-time study accomplishments and mock tests of your buddies.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {!feed || feed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                        <div className="h-16 w-16 bg-muted/40 border border-border/30 rounded-2xl flex items-center justify-center text-muted-foreground/40 mb-4">
                            <Clock className="h-8 w-8" />
                        </div>
                        <p className="font-bold text-foreground/80 text-sm">Quiet in here...</p>
                        <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
                            Add buddies to see their mock test attempts, streaks, and study logs here.
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-6 border-l border-border/60 space-y-6">
                        {feed.map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {item.type === "test_attempt" && <Trophy className="h-1.5 w-1.5 text-white" />}
                                    {item.type === "task_completed" && <Check className="h-1.5 w-1.5 text-white" />}
                                    {item.type === "time_logged" && <Clock className="h-1.5 w-1.5 text-white" />}
                                </div>

                                <div className="bg-muted/15 hover:bg-muted/30 p-4 rounded-xl border border-border/30 hover:border-primary/20 transition-all duration-300">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/profile/${item.username}`} className="font-black text-sm text-foreground hover:text-primary transition-colors block">
                                                @{item.username}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{item.title.substring(item.username.length + 1)}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/60 font-semibold">
                                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <p className="text-xs font-bold text-foreground/90 mt-2">
                                        {item.details}
                                    </p>

                                    {item.type === "test_attempt" && item.percentage !== undefined && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                                Score: {item.score}/{item.max_score} ({item.percentage.toFixed(1)}%)
                                            </Badge>
                                        </div>
                                    )}

                                    {item.type === "time_logged" && item.duration !== undefined && (
                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-600 border-blue-500/20">
                                                Studied: {item.duration} mins
                                            </Badge>
                                            <span>{item.task_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
