"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserActivity, getUserProfile, getUserStats } from "@/features/profile/api";
import { StatsChart } from "@/features/profile/components/StatsChart";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Target, Flame, BarChart3, FileText,
    ArrowUpRight, GraduationCap, MapPin, Share2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ExamCountdownModal, useTargetCountdown } from "@/features/countdown";

export default function ProfilePage() {
    const [isCountdownOpen, setIsCountdownOpen] = useState(false);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getUserProfile,
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["profile-stats"],
        queryFn: getUserStats,
    });

    const { data: activity, isLoading: isActivityLoading } = useQuery({
        queryKey: ["profile-activity"],
        queryFn: getUserActivity,
    });

    const { activeTarget, daysRemaining } = useTargetCountdown(user);

    if (isUserLoading || isStatsLoading || isActivityLoading) {
        return (
            <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!user) return (
        <div className="text-center mt-20 text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">Please log in to view your profile.</p>
        </div>
    );

    const streak = activity?.streak || 0;
    const contributionCount = activity?.contributions?.length || 0;
    const mockCount = stats?.length || 0;
    const bestScore = stats && stats.length > 0
        ? Math.max(...stats.map((s: { percentage: number }) => s.percentage))
        : 0;
    const initials = user.username ? user.username.substring(0, 2).toUpperCase() : "ME";

    return (
        <>
            <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
                <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">{initials}</AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                                        @{user.username}
                                    </h1>
                                    {(user.target_exam_name || user.target_exam) && (
                                        <Badge variant="secondary" className="text-[10px] font-semibold">
                                            {user.target_exam_name || user.target_exam}
                                        </Badge>
                                    )}
                                    {user.target_exam && user.target_exam_name && user.target_exam !== user.target_exam_name && (
                                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                            {user.target_exam}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {(user.district || user.state) && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-primary" />
                                            {[user.district, user.state].filter(Boolean).join(", ")}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>Joined {format(new Date(user.joined_at), "MMM yyyy")}</span>
                                </div>

                                {user.bio && (
                                    <p className="text-xs text-foreground/80 pt-0.5 max-w-md">
                                        {user.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/profile/${user.username}`);
                                    toast.success("Profile link copied");
                                }}
                                className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <Share2 className="h-3.5 w-3.5" /> Share
                            </Button>
                            <EditProfileDialog user={user} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border/50">
                        <div
                            onClick={() => setIsCountdownOpen(true)}
                            className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                        >
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Target Goal</span>
                                <Target className="h-3 w-3 text-primary" />
                            </div>
                            <div className="mt-1">
                                <span className="text-base font-bold font-mono">
                                    {daysRemaining !== null ? `${daysRemaining} days` : activeTarget?.name || "Set Goal"}
                                </span>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {activeTarget?.name || "Click to set date"}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/40">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Study Streak</span>
                                <Flame className="h-3 w-3 text-amber-500" />
                            </div>
                            <div className="mt-1">
                                <span className="text-base font-bold font-mono">{streak} days</span>
                                <p className="text-[10px] text-muted-foreground">Daily activity</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/40">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Mock Tests</span>
                                <BarChart3 className="h-3 w-3 text-primary" />
                            </div>
                            <div className="mt-1">
                                <span className="text-base font-bold font-mono">{mockCount}</span>
                                <p className="text-[10px] text-muted-foreground">{bestScore > 0 ? `Best: ${bestScore}%` : "No attempts"}</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/40">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Contributions</span>
                                <FileText className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="mt-1">
                                <span className="text-base font-bold font-mono">{contributionCount}</span>
                                <p className="text-[10px] text-muted-foreground">Experiences & posts</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-xs">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                    <BarChart3 className="h-4 w-4 text-primary" /> Mock Test Progression
                                </CardTitle>
                                {mockCount > 0 && (
                                    <Link href="/mock-tests">
                                        <Badge variant="outline" className="text-[10px] hover:bg-muted cursor-pointer">
                                            Take a test <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                            <CardDescription className="text-xs">Score percentage progression over recent attempts</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <StatsChart data={stats || []} />
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-muted-foreground" /> Recent Activity
                                </CardTitle>
                                {contributionCount > 0 && (
                                    <Link href="/profile/posts">
                                        <Badge variant="outline" className="text-[10px] hover:bg-muted cursor-pointer">
                                            View all <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 flex-1">
                            {!activity?.contributions?.length ? (
                                <div className="py-8 text-center text-xs text-muted-foreground">
                                    <p>Nothing shared yet.</p>
                                    <div className="flex justify-center gap-2 mt-3">
                                        <Link href="/posts/create">
                                            <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg">Post</Button>
                                        </Link>
                                        <Link href="/submit">
                                            <Button size="sm" className="h-7 text-xs rounded-lg bg-primary text-white">Experience</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activity.contributions.slice(0, 4).map((item: { id: number; title: string; details: string }) => (
                                        <div key={item.id} className="p-2.5 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
                                            <p className="text-xs font-semibold leading-tight line-clamp-1">{item.title}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.details}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ExamCountdownModal
                open={isCountdownOpen}
                onOpenChange={setIsCountdownOpen}
                userProfile={user}
            />
        </>
    );
}