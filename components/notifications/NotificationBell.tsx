"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsAsRead, markSingleNotificationAsRead, Notification } from "@/features/notifications/api";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WelcomeDialog } from "./WelcomeDialog";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const queryClient = useQueryClient();

    useNotifications();

    const { data } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications({ pageParam: 1 }),
        refetchInterval: 60000, // fallback polling every 60s
    });

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notificationsList"] });
        }
    });

    const markSingleAsReadMutation = useMutation({
        mutationFn: (id: string) => markSingleNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notificationsList"] });
        }
    });


    const unreadCount = data?.unreadCount || 0;
    const notifications = data?.data || [];

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" sideOffset={12}>
                    <DropdownMenuLabel className="flex justify-between items-center">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0">
                                    {unreadCount} new
                                </Badge>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-0 text-[11px] font-bold text-primary hover:text-primary/80 hover:bg-transparent"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        markAsReadMutation.mutate();
                                    }}
                                    disabled={markAsReadMutation.isPending}
                                >
                                    Mark all as read
                                </Button>
                            </div>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif: Notification) => {
                                if (notif.type === "welcome") {
                                    return (
                                        <DropdownMenuItem
                                            key={notif.id}
                                            className="cursor-pointer p-3 focus:bg-muted/50"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setIsOpen(false);
                                                setWelcomeOpen(true);
                                                if (!notif.is_read) {
                                                    markSingleAsReadMutation.mutate(notif.id);
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3 items-start w-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        PN
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1 overflow-hidden">
                                                    <p className="text-sm leading-tight text-left">
                                                        <span>Welcome to PrepNiti! We're thrilled to have you here. 🚀</span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground text-left">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    );
                                }

                                const href = notif.post_id 
                                    ? (notif.type === "comment_post" || notif.type === "reply_comment" || notif.type === "like_comment"
                                        ? `/posts/${notif.post_id}#comments`
                                        : `/posts/${notif.post_id}`)
                                    : (notif.type === "buddy_request" || notif.type === "buddy_accepted" ? "/buddies" : "#");

                                const snippet = notif.comment?.content || notif.post?.content;

                                return (
                                    <DropdownMenuItem key={notif.id} className="cursor-pointer p-3 focus:bg-muted/50" asChild>
                                        <Link 
                                            href={href}
                                            onClick={() => {
                                                if (!notif.is_read) {
                                                    markSingleAsReadMutation.mutate(notif.id);
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3 items-start w-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {notif.actor?.username ? notif.actor.username.substring(0, 2).toUpperCase() : "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1 overflow-hidden">
                                                    <p className="text-sm leading-tight text-left">
                                                        <span className="font-semibold">{notif.actor?.username}</span>{" "}
                                                        {notif.type === "like_post" && "liked your post."}
                                                        {notif.type === "comment_post" && "commented on your post."}
                                                        {notif.type === "like_comment" && "liked your comment."}
                                                        {notif.type === "reply_comment" && "replied to your comment."}
                                                        {notif.type === "buddy_request" && "sent you a buddy request."}
                                                        {notif.type === "buddy_accepted" && "accepted your buddy request."}
                                                    </p>

                                                    {snippet && (
                                                        <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1 border-l-2 border-border/40 pl-1.5 text-left">
                                                            "{snippet}"
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground text-left">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                                )}
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="w-full text-center cursor-pointer font-bold py-2 text-xs text-primary hover:text-primary/80 focus:bg-muted/50" asChild>
                        <Link href="/notifications" className="block w-full text-center">
                            View all notifications
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <WelcomeDialog open={welcomeOpen} onOpenChange={setWelcomeOpen} />
        </>
    );
}
