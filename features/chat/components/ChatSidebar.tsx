"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare,
    Loader2,
    Plus,
    Search,
    Users,
    Check
} from "lucide-react";
import {
    RoomDetail,
    ChatMessage,
    createChatRoom
} from "../chat_api";
import { UserProfile } from "@/features/profile/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface ChatSidebarProps {
    rooms: RoomDetail[];
    activeRoomId: string | null;
    setActiveRoomId: (id: string | null) => void;
    buddies: UserProfile[];
    isLoadingRooms: boolean;
    isLoadingBuddies: boolean;
    isConnected: boolean;
    currentUserId: string;
    stripMarkdown: (text: string) => string;
}

export function ChatSidebar({
    rooms,
    activeRoomId,
    setActiveRoomId,
    buddies,
    isLoadingRooms,
    isLoadingBuddies,
    isConnected,
    currentUserId,
    stripMarkdown
}: ChatSidebarProps) {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedBuddyUsername, setSelectedBuddyUsername] = useState<string | null>(null);

    // Mutation: Create Room
    const createRoomMutation = useMutation({
        mutationFn: createChatRoom,
        onSuccess: (newRoom) => {
            queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
            setActiveRoomId(newRoom.id);
            setIsCreateOpen(false);
            setGroupName("");
            setSelectedBuddyUsername(null);
        }
    });

    const handleCreateConversation = () => {
        if (isGroup) {
            if (!groupName.trim()) return;
            createRoomMutation.mutate({
                is_group: true,
                group_name: groupName.trim()
            });
        } else {
            if (!selectedBuddyUsername) return;
            createRoomMutation.mutate({
                is_group: false,
                partner_username: selectedBuddyUsername
            });
        }
    };

    // Filter conversations based on query
    const filteredRooms = rooms.filter(room => {
        if (room.is_group) {
            return room.name?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return room.members.some(member =>
            member.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

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

    return (
        <div className="w-80 border-r border-border flex flex-col bg-muted/10 shrink-0">
            {/* Header Actions block */}
            <div className="p-4 flex items-center justify-between border-b border-border bg-card">
                <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4.5 w-4.5 text-primary shrink-0" />
                        <h2 className="text-sm font-black tracking-tight text-foreground uppercase">Study Hub Chat</h2>
                    </div>
                    {!isConnected && (
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black w-fit mt-0.5 animate-pulse">
                            <Loader2 className="h-2 w-2 animate-spin shrink-0" />
                            <span>connecting...</span>
                        </div>
                    )}
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
                            <Plus className="h-4 w-4 text-primary" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-foreground font-black text-lg">Start Conversation</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="flex items-center space-x-2 border-b border-border pb-4">
                                <Button
                                    type="button"
                                    variant={!isGroup ? "default" : "ghost"}
                                    onClick={() => setIsGroup(false)}
                                    className="flex-1 text-xs h-9 rounded-xl font-bold"
                                >
                                    Direct Message
                                </Button>
                                <Button
                                    type="button"
                                    variant={isGroup ? "default" : "ghost"}
                                    onClick={() => setIsGroup(true)}
                                    className="flex-1 text-xs h-9 rounded-xl font-bold"
                                >
                                    Group Chat
                                </Button>
                            </div>

                            {isGroup ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground">Group Name</label>
                                    <Input
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value)}
                                        placeholder="Study Squad"
                                        className="bg-muted/40 border-border text-foreground rounded-xl text-xs h-9"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground">Select Buddy</label>
                                    {isLoadingBuddies ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        </div>
                                    ) : buddies.length === 0 ? (
                                        <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">Add buddies to start a conversation</p>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                            {buddies.map(buddy => (
                                                <button
                                                    key={buddy.id}
                                                    onClick={() => setSelectedBuddyUsername(buddy.username)}
                                                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${selectedBuddyUsername === buddy.username ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-6 w-6 border border-border">
                                                            <AvatarFallback className="bg-primary/15 text-[9px] text-primary font-black">
                                                                {buddy.username.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-bold text-foreground">{buddy.username}</span>
                                                    </div>
                                                    {selectedBuddyUsername === buddy.username && <Check className="h-3.5 w-3.5 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleCreateConversation}
                                disabled={createRoomMutation.isPending || (!isGroup && !selectedBuddyUsername) || (isGroup && !groupName.trim())}
                                className="w-full font-bold rounded-xl text-xs h-9"
                            >
                                {createRoomMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Start Chat
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter Search Input */}
            <div className="p-3 border-b border-border bg-card">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search conversation..."
                        className="pl-9 bg-muted/40 border-border text-foreground rounded-xl text-xs h-9 placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Room List scroll stream */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
                {isLoadingRooms ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Loading chats...</span>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center text-muted-foreground text-xs py-8 border border-dashed border-border/80 rounded-2xl m-2">
                        No conversations found.
                    </div>
                ) : (
                    filteredRooms.map(room => {
                        const meta = getRoomMetadata(room);
                        const isActive = room.id === activeRoomId;
                        const lastMsg = room.last_message;
                        const hasUnread = room.unread_count > 0;

                        return (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoomId(room.id)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-2xl text-left border transition-all ${isActive ? "border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 text-foreground shadow-sm font-medium" : "border-transparent hover:bg-muted text-foreground"}`}
                            >
                                <Avatar className={`h-10 w-10 border shadow-sm shrink-0 ${isActive ? "border-primary/25 bg-primary/10" : "border-border bg-background"}`}>
                                    <AvatarFallback>
                                        {meta.avatarFallback}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-xs font-black truncate uppercase tracking-wider ${isActive ? "text-primary" : "text-foreground"}`}>
                                            {meta.title}
                                        </h4>
                                        {lastMsg && (
                                            <span className={`text-[8px] font-bold ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                                                {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className={`text-[10px] truncate max-w-[140px] ${isActive ? "text-muted-foreground font-medium" : hasUnread ? "text-foreground font-black" : "text-muted-foreground/80 font-medium"}`}>
                                            {lastMsg ? stripMarkdown(lastMsg.content) : meta.subtitle}
                                        </p>
                                        {hasUnread && !isActive && (
                                            <span className="bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[15px] text-center shadow-sm animate-pulse">
                                                {room.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
