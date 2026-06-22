"use client";

import { useState, useEffect } from "react";
import { Post } from "@/features/posts/api";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BACKEND_URL } from "@/lib/api";

export interface PostCardProps {
    post: Post;
    isBookmarked: boolean;
    onLike: () => void;
    onBookmark: () => void;
    isLiked?: boolean;
    isLikePending?: boolean;
    isBookmarkPending?: boolean;
    viewMode?: "feed" | "detail";
    isAuthor?: boolean;
    onDelete?: () => void;
    isDeletePending?: boolean;
    commentCount?: number;
    delay?: number;
    className?: string;
}

export function PostCard({
    post,
    isBookmarked,
    onLike,
    onBookmark,
    isLiked = false,
    isLikePending = false,
    isBookmarkPending = false,
    viewMode = "feed",
    isAuthor = false,
    onDelete,
    isDeletePending = false,
    commentCount,
    delay = 0,
    className,
}: PostCardProps) {
    const [localLiked, setLocalLiked] = useState(isLiked);
    const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);

    useEffect(() => {
        setLocalLiked(isLiked);
    }, [isLiked]);

    useEffect(() => {
        setLocalUpvotes(post.upvotes);
    }, [post.upvotes]);

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        const url = `${window.location.origin}/posts/${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    const cardClasses = cn(
        viewMode === "feed"
            ? "hover:shadow-md transition-all duration-300 border-primary/40 overflow-hidden bg-card rounded-xl"
            : "bg-card border border-primary/40 rounded-2xl shadow-sm overflow-hidden mb-8",
        className
    );

    const cardContentClasses = cn(
        "px-5 pb-3",
        viewMode === "feed" ? "cursor-pointer" : ""
    );

    const mediaUrl = post.media_url ? `${BACKEND_URL}${post.media_url}` : null;
    const finalCommentCount = commentCount !== undefined ? commentCount : post.comment_count;

    const renderCardContentInner = () => (
        <>
            <MarkdownPreview value={post.content} />
            {mediaUrl && (
                <div className={cn(
                    "rounded-xl overflow-hidden border border-border bg-muted/10",
                    viewMode === "detail" ? "mt-4" : "mt-3"
                )}>
                    {post.media_type === "video" ? (
                        <video
                            src={mediaUrl}
                            controls
                            className={cn(
                                "w-full bg-black/5",
                                viewMode === "detail" ? "max-h-[600px]" : "max-h-[400px]"
                            )}
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            alt="Post Media"
                            className={cn(
                                "w-full object-cover bg-black/5",
                                viewMode === "detail" ? "max-h-[600px]" : "max-h-[400px]"
                            )}
                        />
                    )}
                </div>
            )}

            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className={cn(
                                "text-sm font-semibold text-primary/80",
                                viewMode === "feed" && "hover:text-primary hover:underline"
                            )}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </>
    );

    const MotionWrapper = viewMode === "feed" ? motion.div : motion.article;
    const animationProps = viewMode === "feed"
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.3, delay }
        }
        : {
            initial: { opacity: 0, y: 15 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4 }
        };

    return (
        <MotionWrapper {...animationProps}>
            <Card className={cardClasses}>
                <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <Avatar className={cn("h-10 w-10 border shadow-sm", viewMode === "feed" && "cursor-pointer hover:opacity-80 transition-opacity")}>
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                    {post.user?.username ? post.user.username.substring(0, 2).toUpperCase() : "AN"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className={cn("text-sm font-bold leading-none text-foreground", viewMode === "feed" && "hover:underline cursor-pointer")}>
                                    {post.user?.username || "Anonymous"}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {viewMode === "detail" && isAuthor && onDelete && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                post and remove the data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={onDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                disabled={isDeletePending}
                                            >
                                                {isDeletePending ? "Deleting..." : "Yes, delete post"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground rounded-full", viewMode === "feed" && "-mt-1 -mr-2")}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {viewMode === "feed" ? (
                    <Link href={`/posts/${post.id}`}>
                        <CardContent className={cardContentClasses}>
                            {renderCardContentInner()}
                        </CardContent>
                    </Link>
                ) : (
                    <CardContent className={cardContentClasses}>
                        {renderCardContentInner()}
                    </CardContent>
                )}

                <CardFooter className={cn("px-5 py-3 border-t border-muted/20", viewMode === "detail" && "bg-muted/5")}>
                    <div className="flex items-center justify-between w-full text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const nextLiked = !localLiked;
                                    setLocalLiked(nextLiked);
                                    setLocalUpvotes((prev) => prev + (nextLiked ? 1 : -1));
                                    onLike();
                                }}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 h-8 rounded-lg transition-colors",
                                    localLiked ? "text-red-500 hover:text-red-600" : "hover:text-rose-500"
                                )}
                            >
                                <Heart className={cn("h-4 w-4 transition-all", localLiked ? "fill-red-500 text-red-500 scale-110" : "")} />
                                <span className="text-xs font-semibold">{localUpvotes}</span>
                            </Button>

                            {viewMode === "feed" ? (
                                <Link href={`/posts/${post.id}`}>
                                    <Button variant="ghost" size="sm" className={cn("flex items-center gap-1.5 px-2.5 h-8 rounded-lg transition-colors", finalCommentCount && finalCommentCount > 0 ? "text-primary hover:text-primary/95" : "hover:text-primary")}>
                                        <MessageCircle className={cn("h-4 w-4", finalCommentCount && finalCommentCount > 0 ? "fill-primary/20 text-primary" : "")} />
                                        <span className="text-xs font-semibold">{finalCommentCount || 0}</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 hover:text-primary px-2.5 h-8 rounded-lg text-primary">
                                    <MessageCircle className="h-4 w-4 fill-primary/20" />
                                    <span className="text-xs font-semibold">{finalCommentCount || 0}</span>
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShare}
                                className="h-8 w-8 rounded-lg hover:text-primary"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onBookmark();
                            }}
                            disabled={isBookmarkPending}
                            className="h-8 w-8 rounded-lg hover:text-primary"
                        >
                            <Bookmark className={cn(
                                "h-4 w-4",
                                isBookmarked ? 'fill-primary text-primary' : ''
                            )} />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </MotionWrapper>
    );
}
