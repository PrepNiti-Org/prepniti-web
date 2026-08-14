"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendBuddyRequest, searchUsers } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, UserPlus, Target } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AddBuddyForm() {
    const [addUsername, setAddUsername] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: searchResults } = useQuery({
        queryKey: ["user-search", addUsername],
        queryFn: () => searchUsers(addUsername),
        enabled: addUsername.trim().length > 1,
        staleTime: 5000,
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sendRequestMutation = useMutation({
        mutationFn: (target: string) => sendBuddyRequest(target),
        onSuccess: (_, target) => {
            toast.success("Buddy Request Sent", {
                description: `Request sent to @${target}.`,
            });
            setAddUsername("");
            setShowDropdown(false);
            queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-recommendations"] });
        },
        onError: (err: any) => {
            toast.error("Error Sending Request", {
                description: err.response?.data?.error || "Failed to send buddy request.",
            });
        },
    });

    const handleSendRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addUsername.trim()) return;
        sendRequestMutation.mutate(addUsername.trim());
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-sm">
            <form onSubmit={handleSendRequestSubmit} className="flex items-center gap-2 shrink-0 bg-background/60 backdrop-blur-sm p-2 rounded-xl border border-border/40 shadow-sm w-full">
                <Search className="h-4 w-4 text-muted-foreground/60 ml-2 shrink-0" />
                <Input
                    placeholder="Add buddy by username..."
                    value={addUsername}
                    onChange={(e) => {
                        setAddUsername(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="bg-transparent border-0 focus-visible:ring-0 text-xs flex-1 shadow-none h-8 p-0"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={sendRequestMutation.isPending || !addUsername.trim()}
                    className="bg-primary hover:bg-primary/95 text-white font-bold h-8 text-xs rounded-lg animate-fade-in shrink-0"
                >
                    {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
                </Button>
            </form>

            {showDropdown && addUsername.trim().length > 1 && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No users found matching "{addUsername}"
                        </div>
                    ) : (
                        <div className="py-1">
                            {searchResults.map((user) => {
                                const initials = user.username ? user.username.substring(0, 2).toUpperCase() : "US";
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            setAddUsername(user.username);
                                            setShowDropdown(false);
                                        }}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar className="h-7 w-7 border border-border/50 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 text-left">
                                                <p className="text-xs font-black truncate text-foreground">@{user.username}</p>
                                                {user.target_exam && (
                                                    <span className="inline-flex items-center text-[9px] text-muted-foreground font-semibold mt-0.5">
                                                        <Target className="h-2 w-2 mr-0.5 text-primary shrink-0" />
                                                        {user.target_exam}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sendRequestMutation.mutate(user.username);
                                            }}
                                            disabled={sendRequestMutation.isPending}
                                            title={`Add @${user.username} as buddy`}
                                        >
                                            <UserPlus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
