"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare,
    Loader2,
    PanelRightClose,
    PanelRight,
    Clock
} from "lucide-react";
import {
    getChatRooms,
    getRoomMessages,
    markRoomAsRead,
    RoomDetail,
    ChatMessage
} from "../chat_api";
import { getBuddies } from "@/features/profile/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { ChatSidebar } from "./ChatSidebar";
import { MessageArea } from "./MessageArea";
import { CompanionPanel } from "./CompanionPanel";
import { ChatMessageInput } from "./ChatMessageInput";


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { useChatSocket } from "../hooks/useChatSocket";
import { api } from "@/lib/api";

export function ChatWorkspace() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isCompanionOpen, setIsCompanionOpen] = useState(false);
    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    const [editorTextLength, setEditorTextLength] = useState(0);
    const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, code: false });

    // tempId for the current in-flight optimistic message (negative, never clashes with real IDs)
    const optimisticTempIdRef = useRef<number | null>(null);

    // Get the current user's ID so we can reliably align messages left/right
    const currentUserId = typeof window !== "undefined"
        ? (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").id ?? ""; } catch { return ""; } })()
        : "";

    // Add Member Dialog State
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedAddUsername, setSelectedAddUsername] = useState<string | null>(null);

    // Typing Indicators State & Refs
    const [typingUsers, setTypingUsers] = useState<{ [userId: string]: { username: string; isTyping: boolean } }>({});
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCurrentlyTypingRef = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);

    // Queries
    const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
        queryKey: ["chat-rooms"],
        queryFn: getChatRooms
    });

    const { data: buddies = [], isLoading: isLoadingBuddies } = useQuery({
        queryKey: ["buddies"],
        queryFn: getBuddies
    });

    const activeRoom = rooms.find(r => r.id === activeRoomId);

    // Find buddy details for DMs to power the Accountability Companion panel
    const activeBuddy = buddies.find(b =>
        activeRoom &&
        !activeRoom.is_group &&
        activeRoom.members.some(m => m.username === b.username && m.username !== "me")
    );

    // Fetch buddy comparison progress statistics
    const { data: compareData, isLoading: isLoadingCompare } = useQuery({
        queryKey: ["buddy-compare", activeBuddy?.username],
        queryFn: async () => {
            if (!activeBuddy?.username) return null;
            const res = await api.get(`/buddies/compare/${activeBuddy.username}`);
            return res.data.data;
        },
        enabled: !!activeBuddy?.username
    });

    // Fetch messages when room selection changes
    useEffect(() => {
        if (!activeRoomId) return;

        setMessages([]);
        getRoomMessages(activeRoomId, 0, 40)
            .then(data => {
                setMessages(data);
                markRoomAsRead(activeRoomId).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
                });
            })
            .catch(err => console.error("Failed to load messages:", err));

        // Clear typing indicators when changing rooms
        setTypingUsers({});
    }, [activeRoomId, queryClient]);

    // Live socket handler
    const { isConnected, sendTypingState } = useChatSocket({
        onMessageReceived: (msg: ChatMessage) => {
            queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });

            if (msg.room_id === activeRoomId) {
                setMessages(prev => {
                    const tempIdx = prev.findIndex(m => m.id < 0 && m.content === msg.content);
                    if (tempIdx !== -1) {
                        return prev.map((m, i) => i === tempIdx ? msg : m);
                    }
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });

                markRoomAsRead(activeRoomId).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
                });
            }
        },
        onTypingReceived: (evt) => {
            if (evt.room_id === activeRoomId) {
                setTypingUsers(prev => ({
                    ...prev,
                    [evt.user_id]: { username: evt.username, isTyping: evt.is_typing }
                }));
            }
        },
        onReadReceiptReceived: (evt) => {
            if (evt.room_id === activeRoomId) {
                queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
            }
        }
    });

    // Auto scroll to bottom
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, typingUsers]);

    // selectionchange listener to highlight bold/italic/code buttons based on caret position
    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const editor = editorRef.current;
            if (!editor || !editor.contains(selection.anchorNode)) return;

            const isBold = document.queryCommandState("bold");
            const isItalic = document.queryCommandState("italic");

            // Traverse selection nodes to find parent code tags
            let isCode = false;
            let node: Node | null = selection.anchorNode;
            while (node && node !== editor) {
                if (node.nodeName === "CODE") {
                    isCode = true;
                    break;
                }
                node = node.parentNode;
            }

            setActiveFormats({ bold: isBold, italic: isItalic, code: isCode });
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);



    // Mutation: Add Member
    const addMemberMutation = useMutation({
        mutationFn: async ({ roomId, username }: { roomId: string; username: string }) => {
            return api.post(`/chat/rooms/${roomId}/members`, { username });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
            setIsAddMemberOpen(false);
            setSelectedAddUsername(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || "Failed to add member");
        }
    });

    // Mutation: Leave Group
    const leaveGroupMutation = useMutation({
        mutationFn: async (roomId: string) => {
            return api.delete(`/chat/rooms/${roomId}/members`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
            setActiveRoomId(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || "Failed to leave group");
        }
    });

    // Send message helper
    const submitMessageText = async (text: string) => {
        if (!text.trim() || !activeRoomId) return;

        const tempId = -Date.now();
        optimisticTempIdRef.current = tempId;

        const optimisticMsg: ChatMessage = {
            id: tempId,
            room_id: activeRoomId,
            sender_id: currentUserId,
            content: text,
            created_at: new Date().toISOString(),
            sender: { id: currentUserId, username: "me" },
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await api.post(`/chat/rooms/${activeRoomId}/messages`, { content: text });
            const newMsg: ChatMessage = res.data.data;

            setMessages(prev => {
                const withoutTemp = prev.filter(m => m.id !== tempId);
                if (withoutTemp.some(m => m.id === newMsg.id)) {
                    return withoutTemp;
                }
                return prev.map(m => m.id === tempId ? newMsg : m);
            });

            queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            if (optimisticTempIdRef.current === tempId) optimisticTempIdRef.current = null;
        }
    };

    // Form onSubmit handler for contenteditable editor
    const sendMessage = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const html = editor.innerHTML;
        const content = htmlToMarkdown(html).trim();
        if (!content) return;

        // Clear input box
        editor.innerHTML = "";
        setIsEditorEmpty(true);
        setEditorTextLength(0);

        await submitMessageText(content);
    };

    const handleTypingEvent = () => {
        if (!activeRoomId || !sendTypingState) return;

        if (!isCurrentlyTypingRef.current) {
            isCurrentlyTypingRef.current = true;
            sendTypingState(activeRoomId, true);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isCurrentlyTypingRef.current = false;
            sendTypingState(activeRoomId, false);
        }, 2000);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const text = e.currentTarget.innerText;
        setEditorTextLength(text.length);
        setIsEditorEmpty(text.trim().length === 0);

        // Fire real-time typing events
        handleTypingEvent();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };



    // Secure Markdown Parser for rendering chat bubbles dynamically as React nodes
    const parseMarkdown = (content: string, message?: ChatMessage) => {
        if (!content) return "";

        const parts: React.ReactNode[] = [];
        let currentIndex = 0;

        // Match code blocks (`code`), bold (**text**), and italic (*text*)
        const regex = /(`[^`\n]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const matchIndex = match.index;
            const token = match[0];

            // Push plain text segment before the formatting token
            if (matchIndex > currentIndex) {
                parts.push(content.substring(currentIndex, matchIndex));
            }

            const isMe = message && (message.sender_id === currentUserId || (message.id < 0 && message.sender.username === "me"));

            if (token.startsWith("`") && token.endsWith("`")) {
                parts.push(
                    <code
                        key={matchIndex}
                        className={isMe
                            ? "bg-black/25 text-white px-1.5 py-0.5 rounded font-mono text-[10px] border border-white/5"
                            : "bg-muted dark:bg-muted/80 text-foreground px-1.5 py-0.5 rounded font-mono text-[10px] border border-border/40"
                        }
                    >
                        {token.slice(1, -1)}
                    </code>
                );
            } else if (token.startsWith("**") && token.endsWith("**")) {
                parts.push(
                    <strong key={matchIndex} className={`font-extrabold ${isMe ? "text-white" : "text-foreground"}`}>
                        {token.slice(2, -2)}
                    </strong>
                );
            } else if (token.startsWith("*") && token.endsWith("*")) {
                parts.push(
                    <em key={matchIndex} className={`italic ${isMe ? "text-white" : "text-foreground"}`}>
                        {token.slice(1, -1)}
                    </em>
                );
            }

            currentIndex = regex.lastIndex;
        }

        if (currentIndex < content.length) {
            parts.push(content.substring(currentIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    // WYSIWYG HTML to clean Markdown converter
    const htmlToMarkdown = (html: string): string => {
        let text = html;
        // Replace bold tags
        text = text.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, "**$2**");
        // Replace italic tags
        text = text.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, "*$2*");
        // Replace code tags
        text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
        // Replace list elements or headers if any
        text = text.replace(/<div[^>]*>(.*?)<\/div>/gi, "\n$2");
        text = text.replace(/<br\s*\/?>/gi, "\n");

        // Strip out remaining HTML tags securely
        const temp = document.createElement("div");
        temp.innerHTML = text;
        return temp.textContent || temp.innerText || "";
    };

    // Helper to strip markdown tokens from message preview logs
    const stripMarkdown = (text: string): string => {
        if (!text) return "";
        return text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`(.*?)`/g, "$1");
    };

    // Apply inline style formatting to selection
    const applyFormat = (style: "bold" | "italic" | "code") => {
        const editor = editorRef.current;
        if (!editor) return;

        if (style === "bold") {
            document.execCommand("bold", false);
        } else if (style === "italic") {
            document.execCommand("italic", false);
        } else if (style === "code") {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            if (!selectedText) return;

            const codeElement = document.createElement("code");
            codeElement.className = "bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-primary";
            codeElement.textContent = selectedText;

            range.deleteContents();
            range.insertNode(codeElement);

            // Move cursor after the inserted code block
            range.setStartAfter(codeElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Query formatting state synchronously so buttons highlight instantly
        const isBold = document.queryCommandState("bold");
        const isItalic = document.queryCommandState("italic");
        let isCode = false;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            let node: Node | null = selection.anchorNode;
            while (node && node !== editor) {
                if (node.nodeName === "CODE") {
                    isCode = true;
                    break;
                }
                node = node.parentNode;
            }
        }
        setActiveFormats({ bold: isBold, italic: isItalic, code: isCode });

        // Trigger input event to update charCount / empty state
        const text = editor.innerText;
        setEditorTextLength(text.length);
        setIsEditorEmpty(text.trim().length === 0);
    };





    // Get display characteristics for room
    const getRoomMetadata = (room: RoomDetail) => {
        if (room.is_group) {
            return {
                title: room.name || "Group Chat",
                avatarFallback: <MessageSquare className="h-5 w-5 text-primary" />,
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
        <div className="flex h-full w-full overflow-hidden bg-card transition-all duration-300">
            {/* Left Sidebar Conversation Panel */}
            <ChatSidebar
                rooms={rooms}
                activeRoomId={activeRoomId}
                setActiveRoomId={setActiveRoomId}
                buddies={buddies}
                isLoadingRooms={isLoadingRooms}
                isLoadingBuddies={isLoadingBuddies}
                isConnected={isConnected}
                currentUserId={currentUserId}
                stripMarkdown={stripMarkdown}
            />

            {/* Right Message stream Pane */}
            <div className="flex-1 flex flex-col bg-background">
                {activeRoom ? (
                    <>
                        {/* Selected Room Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-9 w-9 border border-border bg-background shadow-sm">
                                    <AvatarFallback className="bg-primary/5 text-primary">
                                        {getRoomMetadata(activeRoom).avatarFallback}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xs font-black text-foreground">{getRoomMetadata(activeRoom).title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium">{getRoomMetadata(activeRoom).subtitle}</p>
                                </div>
                            </div>

                            {/* Toggle Right Panel Side Panel */}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsCompanionOpen(!isCompanionOpen)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 rounded-lg transition-all"
                            >
                                {isCompanionOpen ? <PanelRightClose className="h-4.5 w-4.5 text-primary" /> : <PanelRight className="h-4.5 w-4.5" />}
                            </Button>
                        </div>

                        {/* Middle Content: Chat stream + Accountability Panel */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Messages Stream Container */}
                            <MessageArea
                                messages={messages}
                                currentUserId={currentUserId}
                                activeRoom={activeRoom}
                                typingUsers={typingUsers}
                                messagesContainerRef={messagesContainerRef}
                                messagesEndRef={messagesEndRef}
                                parseMarkdown={parseMarkdown}
                            />

                            {/* Column 3: Accountability Companion */}
                            <CompanionPanel
                                isCompanionOpen={isCompanionOpen}
                                setIsCompanionOpen={setIsCompanionOpen}
                                activeRoom={activeRoom}
                                activeBuddy={activeBuddy}
                                currentUserId={currentUserId}
                                compareData={compareData}
                                isLoadingCompare={isLoadingCompare}
                                setIsAddMemberOpen={setIsAddMemberOpen}
                                leaveGroupMutation={leaveGroupMutation}
                                activeRoomId={activeRoomId}
                            />
                        </div>

                        {/* Send Message Input form */}
                        <ChatMessageInput
                            editorRef={editorRef}
                            isEditorEmpty={isEditorEmpty}
                            editorTextLength={editorTextLength}
                            activeFormats={activeFormats}
                            applyFormat={applyFormat}
                            handleInput={handleInput}
                            handleKeyDown={handleKeyDown}
                            sendMessage={sendMessage}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-4 text-primary animate-bounce">
                            <MessageSquare className="h-7 w-7" />
                        </div>
                        <h3 className="text-sm font-black text-foreground">Select a conversation</h3>
                        <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">Open a chat from the sidebar or start a new direct message with one of your accountability buddies.</p>
                    </div>
                )}
            </div>

            {/* Add Member Dialog (kept here as it modifies group states managed by queryClient invalidations) */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-foreground font-black text-lg">Add Group Member</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">Select Buddy to Invite</label>
                            {isLoadingBuddies ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : (() => {
                                const invites = buddies.filter(buddy =>
                                    activeRoom &&
                                    !activeRoom.members.some((m: any) => m.username === buddy.username)
                                );

                                if (invites.length === 0) {
                                    return <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">All buddies are already in this group</p>;
                                }

                                return (
                                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                        {invites.map(buddy => (
                                            <button
                                                key={buddy.id}
                                                onClick={() => setSelectedAddUsername(buddy.username)}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${selectedAddUsername === buddy.username ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6 border border-border">
                                                        <AvatarFallback className="bg-primary/15 text-[9px] text-primary font-black">
                                                            {buddy.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-bold text-foreground">{buddy.username}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                if (activeRoomId && selectedAddUsername) {
                                    addMemberMutation.mutate({ roomId: activeRoomId, username: selectedAddUsername });
                                }
                            }}
                            disabled={!selectedAddUsername || addMemberMutation.isPending}
                            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-xs h-10 shadow-md"
                        >
                            {addMemberMutation.isPending ? "Adding Member..." : "Add to Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
