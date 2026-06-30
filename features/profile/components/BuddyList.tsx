"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBuddies, removeBuddy, blockUser } from "../api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Search, Swords, BarChart2, UserMinus, MoreVertical, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { CreatePactDialog } from "./CreatePactDialog";
import { BuddyCompareView } from "./BuddyCompareView";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function BuddyList() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [pactTarget, setPactTarget] = useState<string | null>(null);
    const [compareTarget, setCompareTarget] = useState<string | null>(null);

    const { data: buddies, isLoading } = useQuery({
        queryKey: ["buddies"],
        queryFn: getBuddies,
    });

    const removeBuddyMutation = useMutation({
        mutationFn: (buddyId: string) => removeBuddy(buddyId),
        onSuccess: () => {
            toast.success("Buddy removed.");
            queryClient.invalidateQueries({ queryKey: ["buddies"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-feed"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-recommendations"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to remove buddy.");
        },
    });

    const blockUserMutation = useMutation({
        mutationFn: (targetUserId: string) => blockUser(targetUserId),
        onSuccess: () => {
            toast.success("User blocked.");
            queryClient.invalidateQueries({ queryKey: ["buddies"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-feed"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-recommendations"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to block user.");
        },
    });

    const filteredBuddies = buddies?.filter((b) =>
        b.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        My Buddies
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="h-12 bg-muted/40 animate-pulse rounded-xl" />
                    <div className="h-12 bg-muted/40 animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-border/50">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                My Buddies
                            </CardTitle>
                            <CardDescription className="text-xs">Your accountability partner network.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                            <Input
                                placeholder="Search buddies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-8 text-xs rounded-lg"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {filteredBuddies.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-xs">
                            {searchQuery ? "No buddies found matching search." : "No buddies added yet. Send requests using the quick add bar!"}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredBuddies.map((buddy) => {
                                const initials = buddy.username ? buddy.username.substring(0, 2).toUpperCase() : "US";
                                return (
                                    <div key={buddy.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-muted/5 hover:bg-muted/10 transition-all duration-300">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-10 w-10 border border-border/50">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${buddy.username}&backgroundColor=6d28d9`} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <Link href={`/profile/${buddy.username}`} className="text-sm font-black text-foreground hover:text-primary transition-colors block">
                                                    @{buddy.username}
                                                </Link>
                                                {buddy.target_exam && (
                                                    <Badge variant="outline" className="text-[8px] tracking-wide uppercase px-1 py-0.5 border-primary/20 text-primary">
                                                        {buddy.target_exam}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCompareTarget(buddy.username)}
                                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                title="Compare stats"
                                            >
                                                <BarChart2 className="h-3.5 w-3.5" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPactTarget(buddy.username)}
                                                className="h-7 w-7 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                                                title="Create study pact"
                                            >
                                                <Swords className="h-3.5 w-3.5" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem
                                                        onClick={() => removeBuddyMutation.mutate(buddy.id.toString())}
                                                        disabled={removeBuddyMutation.isPending}
                                                        className="text-xs font-bold cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-500/5"
                                                    >
                                                        <UserMinus className="h-3.5 w-3.5 mr-2" />
                                                        Remove Buddy
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => blockUserMutation.mutate(buddy.id.toString())}
                                                        disabled={blockUserMutation.isPending}
                                                        className="text-xs font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-500/5"
                                                    >
                                                        <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                                                        Block User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {pactTarget && (
                <CreatePactDialog
                    open={!!pactTarget}
                    onOpenChange={(o) => !o && setPactTarget(null)}
                    buddyUsername={pactTarget}
                />
            )}

            {compareTarget && user && (
                <BuddyCompareView
                    open={!!compareTarget}
                    onOpenChange={(o) => !o && setCompareTarget(null)}
                    buddyUsername={compareTarget}
                    myUsername={user.username}
                />
            )}
        </>
    );
}
