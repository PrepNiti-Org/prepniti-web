"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBuddyRequest, respondBuddyRequest, removeBuddy, blockUser, unblockUser, PublicProfileData } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Loader2, Calendar, Target, Award, Flame, BarChart3,
    FileText, UserPlus, UserCheck, UserMinus, ShieldAlert, MoreVertical
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

interface PublicProfileHeroProps {
    profile: PublicProfileData;
    username: string;
}

export function PublicProfileHero({ profile, username }: PublicProfileHeroProps) {
    const queryClient = useQueryClient();

    const sendRequestMutation = useMutation({
        mutationFn: () => sendBuddyRequest(username),
        onSuccess: () => {
            toast.success("Buddy Request Sent", {
                description: `A buddy request has been sent to @${username}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["public-profile", username] });
        },
        onError: (err: any) => {
            toast.error("Error Sending Request", {
                description: err.response?.data?.error || "Failed to send buddy request.",
            });
        },
    });

    const acceptRequestMutation = useMutation({
        mutationFn: (connId: string) => respondBuddyRequest(connId, true),
        onSuccess: () => {
            toast.success("Buddy Request Accepted", {
                description: `You are now buddies with @${username}!`,
            });
            queryClient.invalidateQueries({ queryKey: ["public-profile", username] });
        },
        onError: (err: any) => {
            toast.error("Error", {
                description: err.response?.data?.error || "Failed to accept request.",
            });
        },
    });

    const removeBuddyMutation = useMutation({
        mutationFn: (buddyId: string) => removeBuddy(buddyId),
        onSuccess: () => {
            toast.success("Buddy Removed", {
                description: `You are no longer buddies with @${username}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["public-profile", username] });
        },
        onError: (err: any) => {
            toast.error("Error", {
                description: err.response?.data?.error || "Failed to remove buddy.",
            });
        },
    });

    const blockMutation = useMutation({
        mutationFn: () => blockUser(profile.id.toString()),
        onSuccess: () => {
            toast.success("User Blocked", {
                description: `@${username} has been blocked.`,
            });
            queryClient.invalidateQueries({ queryKey: ["public-profile", username] });
        },
        onError: (err: any) => {
            toast.error("Error Blocking User", {
                description: err.response?.data?.error || "Failed to block user.",
            });
        },
    });

    const unblockMutation = useMutation({
        mutationFn: () => unblockUser(profile.id.toString()),
        onSuccess: () => {
            toast.success("User Unblocked", {
                description: `@${username} has been unblocked.`,
            });
            queryClient.invalidateQueries({ queryKey: ["public-profile", username] });
        },
        onError: (err: any) => {
            toast.error("Error Unblocking User", {
                description: err.response?.data?.error || "Failed to unblock user.",
            });
        },
    });

    const streak = profile.streak || 0;
    const initials = profile.username ? profile.username.substring(0, 2).toUpperCase() : "US";
    const bestScore = profile.best_score || 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 p-8 shadow-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-2 ring-primary/20 shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}&backgroundColor=6d28d9`} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-black">{initials}</AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                @{profile.username}
                            </h1>
                            {profile.target_exam && (
                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest border border-primary/20 bg-primary/10 text-primary">
                                    <Target className="h-3 w-3 mr-1" />
                                    {profile.target_exam}
                                </Badge>
                            )}
                        </div>
                        {profile.bio && (
                            <p className="text-sm text-foreground/80 italic mt-1 max-w-md leading-relaxed">
                                &ldquo;{profile.bio}&rdquo;
                            </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Candidate joined {new Date(profile.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {profile.buddy_status === "blocked" ? (
                        <Button
                            onClick={() => unblockMutation.mutate()}
                            disabled={unblockMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all duration-350"
                        >
                            {unblockMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <ShieldAlert className="h-4 w-4 mr-2" />
                            )}
                            Unblock User
                        </Button>
                    ) : (
                        <>
                            {profile.buddy_status === "none" && (
                                <Button
                                    onClick={() => sendRequestMutation.mutate()}
                                    disabled={sendRequestMutation.isPending}
                                    className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all duration-350"
                                >
                                    {sendRequestMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <UserPlus className="h-4 w-4 mr-2" />
                                    )}
                                    Add Buddy
                                </Button>
                            )}

                            {profile.buddy_status === "sent" && (
                                <Button disabled variant="secondary" className="font-bold border border-border/60">
                                    <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Request Sent
                                </Button>
                            )}

                            {profile.buddy_status === "received" && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => acceptRequestMutation.mutate(profile.connection_id!)}
                                        disabled={acceptRequestMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        Accept Request
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => removeBuddyMutation.mutate(profile.connection_id!)}
                                        disabled={removeBuddyMutation.isPending}
                                        className="font-bold text-destructive border-destructive/25 hover:bg-destructive/5"
                                    >
                                        Ignore
                                    </Button>
                                </div>
                            )}

                            {profile.buddy_status === "accepted" && (
                                <Button
                                    variant="outline"
                                    onClick={() => removeBuddyMutation.mutate(profile.id.toString())}
                                    disabled={removeBuddyMutation.isPending}
                                    className="font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/40"
                                >
                                    {removeBuddyMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <UserMinus className="h-4 w-4 mr-2" />
                                    )}
                                    Remove Buddy
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-10 w-10 border-border/50 hover:bg-muted">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                    <DropdownMenuItem
                                        onClick={() => blockMutation.mutate()}
                                        disabled={blockMutation.isPending}
                                        className="text-xs font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-500/5"
                                    >
                                        <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                                        Block User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/40">
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
                        <p className="text-xs font-black text-foreground">{profile.mock_count}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Mocks Taken</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <div>
                        <p className="text-xs font-black text-foreground">{bestScore.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Best Score</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm">
                    <FileText className="h-4 w-4 text-violet-500" />
                    <div>
                        <p className="text-xs font-black text-foreground">{profile.contributions?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Posts</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
