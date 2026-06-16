"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getNotifications, markNotificationsAsRead, Notification } from "@/features/notifications/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Check, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { WelcomeDialog } from "@/components/notifications/WelcomeDialog";

export default function NotificationsPage() {
    const { isLoggedIn } = useAuth();
    const queryClient = useQueryClient();
    const [welcomeOpen, setWelcomeOpen] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["notificationsList"],
        queryFn: ({ pageParam }) => getNotifications({ pageParam }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: isLoggedIn,
    });

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notificationsList"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
    });

    if (!isLoggedIn) {
        return (
            <div className="container py-20 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Please log in to view notifications</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    You need to be logged in to access your notification center.
                </p>
                <div className="mt-6">
                    <Link href="/login">
                        <Button>Log In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const unreadCount = data?.pages[0]?.unreadCount || 0;

    return (
        <div className="container max-w-3xl mx-auto space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-sm text-muted-foreground">Stay updated on your discussions and peer interactions</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full font-semibold border-primary/25 hover:bg-primary/10 hover:text-primary transition-colors self-start sm:self-center"
                        onClick={() => markAsReadMutation.mutate()}
                        disabled={markAsReadMutation.isPending}
                    >
                        <Check className="h-4 w-4 mr-1.5" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {status === "pending" ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                </div>
            ) : status === "error" ? (
                <div className="text-center py-10 bg-destructive/10 rounded-xl">
                    <p className="text-destructive font-medium">Failed to load notifications. Please try again.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.pages.map((page, pageIdx) => (
                        <div key={pageIdx} className="space-y-4">
                            {page.data.map((notif: Notification, index: number) => {
                                const isWelcome = notif.type === "welcome";
                                const isBroadcast = notif.type === "broadcast";

                                const snippet = isBroadcast ? undefined : (notif.comment?.content || notif.post?.content);
                                const href = notif.post_id 
                                    ? (notif.type === "comment_post" || notif.type === "reply_comment" || notif.type === "like_comment"
                                        ? `/posts/${notif.post_id}#comments`
                                        : `/posts/${notif.post_id}`)
                                    : "#";

                                const renderContent = () => (
                                    <div className="flex gap-4 items-start w-full text-left">
                                        <Avatar className="h-10 w-10 border shadow-inner">
                                            <AvatarFallback className={`${isBroadcast ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"} font-bold text-sm`}>
                                                {isWelcome ? "PN" : isBroadcast ? "AD" : (notif.actor?.username ? notif.actor.username.substring(0, 2).toUpperCase() : "U")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1 overflow-hidden">
                                            <div className="text-sm leading-normal">
                                                {isWelcome ? (
                                                    <span className="font-medium text-foreground">
                                                        Welcome to PrepNiti! We're thrilled to have you here. Click to read our welcome guide. 🚀
                                                    </span>
                                                ) : isBroadcast ? (
                                                    <span className="font-medium text-foreground block">
                                                        <span className="font-extrabold text-primary block text-base mb-1">📢 {notif.title}</span>
                                                        <span className="text-muted-foreground text-sm leading-relaxed block">{notif.message}</span>
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <span className="font-bold text-foreground">{notif.actor?.username}</span>{" "}
                                                        {notif.type === "like_post" && "liked your post."}
                                                        {notif.type === "comment_post" && "commented on your post."}
                                                        {notif.type === "like_comment" && "liked your comment."}
                                                        {notif.type === "reply_comment" && "replied to your comment."}
                                                    </span>
                                                )}
                                            </div>
                                            {snippet && (
                                                <p className="text-xs text-muted-foreground italic mt-1.5 border-l-2 border-border/60 pl-2 text-left line-clamp-3 bg-muted/20 py-1.5 px-2 rounded-r-md">
                                                    "{snippet}"
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-3 shrink-0 animate-pulse" />
                                        )}
                                    </div>
                                );

                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                    >
                                        <Card className={`overflow-hidden border-primary/20 bg-card/65 transition-all hover:bg-card/90 rounded-2xl ${!notif.is_read ? 'shadow-sm border-l-[3px] border-l-primary' : ''}`}>
                                            <CardContent className="p-4 sm:p-5">
                                                {isWelcome ? (
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() => setWelcomeOpen(true)}
                                                    >
                                                        {renderContent()}
                                                    </div>
                                                ) : (
                                                    <Link href={href}>
                                                        {renderContent()}
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}

                    {data.pages[0].data.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold">All quiet here</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                You don't have any notifications at the moment. Keep discussing and interacting with the community!
                            </p>
                            <div className="mt-6">
                                <Link href="/posts">
                                    <Button variant="outline">Browse Discussions</Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {hasNextPage && (
                        <div className="mt-8 text-center pb-8">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full shadow-sm"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? "Loading more..." : "Load More Notifications"}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <WelcomeDialog open={welcomeOpen} onOpenChange={setWelcomeOpen} />
        </div>
    );
}
