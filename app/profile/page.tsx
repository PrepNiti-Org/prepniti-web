"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserActivity, getUserProfile, getUserStats } from "@/features/profile/api";
import { StatsChart } from "@/features/profile/components/StatsChart";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Loader2, Mail, Calendar, Target, Award, Flame, BookOpen,
    BarChart3, FileText, Sparkles, Clock, ArrowUpRight, GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
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

    if (isUserLoading || isStatsLoading || isActivityLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-80 rounded-2xl" />
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return (
        <div className="text-center mt-20 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Please log in to view your profile.</p>
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
        <motion.div
            className="max-w-6xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 p-5 sm:p-8 shadow-sm">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />
                    <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative shrink-0">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-2 ring-primary/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xl font-black">{initials}</AvatarFallback>
                            </Avatar>
                            {streak >= 7 && (
                                <span className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full bg-amber-500 border-2 border-background text-xs font-black">
                                    🔥
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-2xl font-black tracking-tight text-foreground">
                                    @{user.username}
                                </h1>
                                {user.target_exam && (
                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest border border-primary/20 bg-primary/10 text-primary">
                                        <Target className="h-3 w-3 mr-1" />
                                        {user.target_exam}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {user.email}
                            </p>
                            {user.bio && (
                                <p className="text-sm text-foreground/80 italic mt-2 max-w-md leading-relaxed">
                                    &ldquo;{user.bio}&rdquo;
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Member since {new Date(user.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <EditProfileDialog user={user} />
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/40">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                            <Flame className={`h-4 w-4 ${streak > 0 ? 'text-amber-500' : 'text-muted-foreground/40'}`} />
                            <div>
                                <p className="text-xs font-black text-foreground">{streak} day{streak !== 1 ? 's' : ''}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Streak</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-xs font-black text-foreground">{mockCount}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Mocks Taken</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                            <Award className={`h-4 w-4 ${bestScore >= 80 ? 'text-emerald-500' : bestScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`} />
                            <div>
                                <p className="text-xs font-black text-foreground">{bestScore.toFixed(1)}%</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Best Score</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                            <FileText className="h-4 w-4 text-violet-500" />
                            <div>
                                <p className="text-xs font-black text-foreground">{contributionCount}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Posts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <motion.div variants={itemVariants} className="space-y-5 lg:col-span-1">

                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-r from-muted/60 to-transparent border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Quick Navigation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[
                                { href: "/tracker", icon: Target, label: "Study Tracker", desc: "View your targets", color: "text-violet-500" },
                                { href: "/insights", icon: BarChart3, label: "Insights", desc: "Charts & analytics", color: "text-blue-500" },
                                { href: "/mock-tests", icon: GraduationCap, label: "Mock Tests", desc: "Take a test", color: "text-emerald-500" },
                                { href: "/bookmarks", icon: BookOpen, label: "Bookmarks", desc: "Saved posts", color: "text-amber-500" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className={`p-1.5 rounded-lg bg-muted/60 group-hover:bg-muted ${item.color}`}>
                                        <item.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className={`overflow-hidden border ${streak >= 7 ? 'border-amber-500/30 bg-amber-500/5' : streak > 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50'}`}>
                        <CardContent className="pt-5 pb-5 px-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-amber-500' : 'text-muted-foreground/40'}`} />
                                    Current Streak
                                </span>
                                {streak >= 30 && <Badge className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30">🏆 Legend</Badge>}
                                {streak >= 7 && streak < 30 && <Badge className="text-[10px] bg-orange-500/20 text-orange-600 border-orange-500/30">🔥 On Fire</Badge>}
                            </div>
                            <p className={`text-5xl font-black tracking-tight ${streak > 0 ? 'text-amber-500' : 'text-muted-foreground/30'}`}>
                                {streak}
                                <span className="text-lg ml-2 font-semibold text-muted-foreground">days</span>
                            </p>
                            <div className="mt-4 w-full bg-muted/50 rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                                    style={{ width: `${Math.min(100, (streak / 30) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                {streak < 30 ? `${30 - streak} days to Legend status` : "You're a legend! Keep it going!"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Username</span>
                                <span className="font-bold text-xs text-foreground">@{user.username}</span>
                            </div>
                            {/* <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Role</span>
                                <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
                            </div> */}
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Joined</span>
                                <span className="font-semibold text-xs text-foreground">
                                    {formatDistanceToNow(new Date(user.joined_at), { addSuffix: true })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">

                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                        Mock Test Progression
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">Your score percentages over recent attempts.</CardDescription>
                                </div>
                                {mockCount > 0 && (
                                    <Link href="/mock-tests">
                                        <Badge variant="outline" className="text-[10px] hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-colors">
                                            Take a test <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <StatsChart data={stats || []} />
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-violet-500" />
                                        Recent Contributions
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">Experiences and posts shared with the community.</CardDescription>
                                </div>
                                {contributionCount > 0 && (
                                    <Link href="/profile/posts">
                                        <Badge variant="outline" className="text-[10px] hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-colors">
                                            All posts <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {!activity?.contributions?.length ? (
                                <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                                    <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mb-4">
                                        <FileText className="h-6 w-6 opacity-30" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground/70">Nothing shared yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Share a post or interview experience with the community.</p>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Link href="/posts/create">
                                            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors text-[11px] py-1.5 px-3">
                                                Create post
                                            </Badge>
                                        </Link>
                                        <Link href="/submit">
                                            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors text-[11px] py-1.5 px-3">
                                                Share experience
                                            </Badge>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activity.contributions.map((item: { id: number; title: string; details: string }) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-primary/20 transition-colors group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors mt-0.5 shrink-0">
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.details}</p>
                                            </div>
                                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </motion.div>
    );
}