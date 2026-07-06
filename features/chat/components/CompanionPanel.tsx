"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    Target, 
    TrendingUp, 
    Flame, 
    Clock, 
    Trophy, 
    UserPlus, 
    LogOut,
    Loader2 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RoomDetail } from "../chat_api";
import { UserProfile } from "@/features/profile/api";

interface CompanionPanelProps {
    isCompanionOpen: boolean;
    setIsCompanionOpen: (open: boolean) => void;
    activeRoom: RoomDetail;
    activeBuddy: UserProfile | undefined;
    currentUserId: string;
    compareData: any;
    isLoadingCompare: boolean;
    setIsAddMemberOpen: (open: boolean) => void;
    leaveGroupMutation: any;
    activeRoomId: string | null;
}

export function CompanionPanel({
    isCompanionOpen,
    setIsCompanionOpen,
    activeRoom,
    activeBuddy,
    currentUserId,
    compareData,
    isLoadingCompare,
    setIsAddMemberOpen,
    leaveGroupMutation,
    activeRoomId
}: CompanionPanelProps) {

    // Get display characteristics for room
    const getRoomMetadata = (room: RoomDetail) => {
        if (room.is_group) {
            return {
                title: room.name || "Group Chat",
                avatarFallback: <Users className="h-5 w-5 text-primary" />,
                subtitle: `${room.members?.length || 0} members`
            };
        }

        const otherUser = room.members.find(m => m.username !== "me");
        const displayName = otherUser ? otherUser.username : "Accountability Partner";
        const fallbackInitials = displayName.substring(0, 2).toUpperCase();

        return {
            title: displayName,
            avatarFallback: <span className="text-sm font-black text-primary">{fallbackInitials}</span>,
            subtitle: otherUser?.target_exam ? `Target: ${otherUser.target_exam}` : "Accountability Partner"
        };
    };

    const meta = getRoomMetadata(activeRoom);

    return (
        <AnimatePresence initial={false}>
            {isCompanionOpen && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="border-l border-border bg-card shrink-0 flex flex-col overflow-y-auto overflow-x-hidden hidden md:flex"
                >
                    <div className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm bg-primary/5">
                    <AvatarFallback className="text-base font-black text-primary">
                        {meta.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="text-sm font-black text-foreground">{meta.title}</h4>
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                        {activeRoom.is_group ? "Group Chat" : "Direct Message"}
                    </span>
                </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Accountability Details container */}
            <div className="p-4 space-y-5 flex-1 text-xs">
                {!activeRoom.is_group ? (
                    /* Direct Message Buddy details */
                    <>
                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-primary" /> Buddy Profile
                            </h5>
                            <div className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-2.5">
                                <div>
                                    <span className="text-[9px] text-muted-foreground font-semibold block">Target Exam</span>
                                    <span className="font-bold text-foreground block mt-0.5">
                                        {activeBuddy?.target_exam || "Not specified"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-muted-foreground font-semibold block">Bio</span>
                                    <p className="text-foreground mt-0.5 text-[11px] leading-relaxed">
                                        {activeBuddy?.bio || "No bio written yet."}
                                    </p>
                                </div>
                                {activeBuddy?.joined_at && (
                                    <div>
                                        <span className="text-[9px] text-muted-foreground font-semibold block">Joined PrepNiti</span>
                                        <span className="font-bold text-foreground block mt-0.5">
                                            {new Date(activeBuddy.joined_at).toLocaleDateString([], { year: "numeric", month: "long" })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparative Accountability Stats Dashboard */}
                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Streak & Stats
                            </h5>
                            {isLoadingCompare ? (
                                <div className="flex justify-center py-4 bg-muted/20 border border-border/40 rounded-xl">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            ) : compareData?.buddy ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl text-center space-y-1">
                                        <span className="text-[9px] text-muted-foreground font-semibold block uppercase">Study Streak</span>
                                        <div className="flex items-center justify-center gap-1">
                                            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                                            <span className="font-black text-foreground text-sm">
                                                {compareData.buddy.streak || 0}d
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl text-center space-y-1">
                                        <span className="text-[9px] text-muted-foreground font-semibold block uppercase">Logged Time</span>
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span className="font-black text-foreground text-xs">
                                                {(() => {
                                                    const totalMin = compareData.buddy.study?.reduce((acc: number, item: any) => acc + item.minutes, 0) || 0;
                                                    const h = Math.floor(totalMin / 60);
                                                    return `${h}h`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/30 border border-border/50 rounded-xl text-center space-y-1 col-span-2">
                                        <span className="text-[9px] text-muted-foreground font-semibold block uppercase">Avg Mock Score</span>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
                                            <span className="font-black text-foreground text-sm">
                                                {(() => {
                                                    const mocks = compareData.buddy.mock || [];
                                                    if (mocks.length === 0) return "No tests";
                                                    const avg = Math.round(mocks.reduce((acc: number, item: any) => acc + item.avg_pct, 0) / mocks.length);
                                                    return `${avg}%`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted/30 border border-border/50 rounded-xl text-center text-muted-foreground text-[10px]">
                                    Stats comparison unavailable.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Group Chat Members List */
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-primary" /> Group Members ({activeRoom.members.length})
                            </h5>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setIsAddMemberOpen(true)}
                                className="h-7 w-7 text-primary hover:bg-primary/5 rounded-lg shrink-0"
                                title="Add Buddy to Group"
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-[120px]">
                            {activeRoom.members.map(member => {
                                const memberFallback = member.username.substring(0, 2).toUpperCase();
                                const isMe = member.id === currentUserId || member.username === "me";
                                return (
                                    <div key={member.id} className="flex items-center gap-2 p-2 bg-muted/20 border border-border/30 rounded-xl">
                                        <Avatar className="h-6 w-6 border border-border bg-background shadow-sm shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-[9px] text-primary font-black">
                                                {memberFallback}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[11px] font-bold text-foreground truncate block">
                                                {member.username} {isMe && "(You)"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-border mt-auto shrink-0">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                    if (activeRoomId && confirm("Are you sure you want to leave this group?")) {
                                        leaveGroupMutation.mutate(activeRoomId);
                                    }
                                }}
                                className="w-full text-[10px] font-bold rounded-xl h-8 border-red-500/20 text-red-500 hover:bg-red-500/5 hover:text-red-600 transition-all flex items-center justify-center gap-1.5"
                            >
                                <LogOut className="h-3.5 w-3.5 animate-pulse" /> Leave Group
                            </Button>
                        </div>
                    </div>
                )}
            </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
