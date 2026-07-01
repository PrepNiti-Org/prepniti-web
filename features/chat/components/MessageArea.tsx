"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage, RoomDetail } from "../chat_api";

interface MessageAreaProps {
    messages: ChatMessage[];
    currentUserId: string;
    activeRoom: RoomDetail | undefined;
    typingUsers: { [userId: string]: { username: string; isTyping: boolean } };
    messagesContainerRef: React.RefObject<HTMLDivElement | null>;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    parseMarkdown: (content: string, message?: ChatMessage) => React.ReactNode;
}

export function MessageArea({
    messages,
    currentUserId,
    activeRoom,
    typingUsers,
    messagesContainerRef,
    messagesEndRef,
    parseMarkdown
}: MessageAreaProps) {

    // Render helper for message stream with grouped clusters and date headers
    const renderMessageStream = () => {
        let lastSenderId: string | null = null;
        let lastTimestamp: Date | null = null;
        let lastDayStr: string | null = null;

        return messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId || (msg.id < 0 && msg.sender.username === "me");
            const msgTime = new Date(msg.created_at);

            // Check day change
            const dayStr = msgTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
            const showDateHeader = dayStr !== lastDayStr;
            lastDayStr = dayStr;

            // Check if grouped (same sender, within 2 minutes)
            const isGrouped = !showDateHeader &&
                lastSenderId === msg.sender_id &&
                lastTimestamp &&
                (msgTime.getTime() - lastTimestamp.getTime()) < 2 * 60 * 1000;

            lastSenderId = msg.sender_id;
            lastTimestamp = msgTime;

            const isPending = msg.id < 0;

            return (
                <div key={msg.id || index} className="space-y-1">
                    {showDateHeader && (
                        <div className="flex justify-center my-6">
                            <span className="bg-muted text-[10px] text-muted-foreground font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-border/50">
                                {dayStr}
                            </span>
                        </div>
                    )}

                    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-4"}`}>
                        <div className={`flex items-end space-x-2 max-w-[75%] ${isMe ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                            {/* Avatar (only on non-grouped messages, aligned left) */}
                            {!isMe && !isGrouped ? (
                                <Avatar className="h-8 w-8 border border-border shrink-0 shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-[10px] text-primary font-black">
                                        {msg.sender.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                !isMe && <div className="w-8 shrink-0" /> // spacer
                            )}

                            <div className="flex flex-col group relative">
                                {/* Sender Label */}
                                {!isMe && !isGrouped && activeRoom?.is_group && (
                                    <span className="text-[10px] font-black text-muted-foreground ml-1.5 mb-1">
                                        {msg.sender.username}
                                    </span>
                                )}

                                {/* Message bubble */}
                                <div className={`p-3 rounded-2xl text-xs leading-relaxed transition-all ${isMe
                                    ? `bg-gradient-to-br from-primary/85 via-primary/75 to-accent/70 text-primary-foreground ${isGrouped ? "rounded-r-md" : "rounded-br-none"} shadow-sm font-medium`
                                    : `bg-card text-foreground border border-border ${isGrouped ? "rounded-l-md" : "rounded-bl-none"} shadow-sm`
                                    } ${isPending ? "opacity-70 border-dashed animate-pulse" : ""}`}>
                                    <p className="whitespace-pre-wrap break-words">{parseMarkdown(msg.content, msg)}</p>
                                </div>

                                {/* Bottom label (Status or Time) */}
                                <div className="flex items-center space-x-1.5 mt-1 ml-1.5 mr-1.5 justify-end">
                                    {isPending ? (
                                        <div className="flex items-center space-x-1 text-[8px] text-muted-foreground">
                                            <Clock className="h-2.5 w-2.5 animate-spin text-primary" />
                                            <span className="font-semibold">sending...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-[8px] text-muted-foreground/60 font-semibold">
                                                {msgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            {isMe && (
                                                <span className="text-[9px] text-primary/70 font-black ml-0.5" title="Sent receipt">
                                                    {(() => {
                                                        if (!activeRoom) return "✓";
                                                        const others = activeRoom.members.filter(m => m.id !== currentUserId && m.username !== "me");
                                                        if (others.length === 0) return "✓";

                                                        const allRead = others.every(m => m.last_read_message_id && m.last_read_message_id >= msg.id);
                                                        return allRead ? "✓✓" : "✓";
                                                    })()}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-1 bg-muted/10 relative"
        >
            {renderMessageStream()}

            {/* Custom High-Fidelity Typing Indicator bubble inside stream */}
            {(() => {
                const typingList = Object.values(typingUsers).filter(u => u.isTyping);
                if (typingList.length === 0) return null;
                return (
                    <div className="flex items-end space-x-2 mt-4 animate-fade-in">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1.5 p-3 bg-card border border-border/80 rounded-2xl w-fit shadow-sm">
                                <span className="flex space-x-1 items-center px-1 h-3">
                                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-duration:1s]" style={{ animationDelay: '0ms' }}></span>
                                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-duration:1s]" style={{ animationDelay: '150ms' }}></span>
                                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-duration:1s]" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold pl-2.5">
                                {typingList.map(u => u.username).join(", ")} {typingList.length === 1 ? "is" : "are"} typing...
                            </span>
                        </div>
                    </div>
                );
            })()}

            <div ref={messagesEndRef} />
        </div>
    );
}
