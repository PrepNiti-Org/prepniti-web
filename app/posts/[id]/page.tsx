"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, deletePost, toggleLike, getComments, createComment, toggleCommentLike, toggleBookmark, getUserBookmarks, Comment } from "@/features/posts/api";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/features/posts/components/PostCard";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const CommentItem = ({ comment, postId, depth = 0 }: { comment: Comment, postId: string, depth?: number }) => {
    const queryClient = useQueryClient();
    const { user, isLoggedIn } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const likeMutation = useMutation({
        mutationFn: () => toggleCommentLike(comment.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
    });

    const replyMutation = useMutation({
        mutationFn: () => createComment(postId, replyText, comment.id),
        onSuccess: () => {
            setReplyText("");
            setIsReplying(false);
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            toast.success("Reply posted!");
        },
        onError: () => {
            toast.error("Failed to post reply");
        }
    });

    return (
        <div className="flex gap-3 pt-4">
            <Avatar className="h-8 w-8 border shadow-sm shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                    {comment.user?.username ? comment.user.username.substring(0, 2).toUpperCase() : "AN"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="bg-card/50 rounded-2xl p-3 border border-transparent hover:border-primary/10 transition-colors">
                    <div className="flex items-baseline gap-2 mb-1">
                        <h5 className="text-[13px] font-bold leading-none text-foreground">
                            {comment.user?.username || "Anonymous"}
                        </h5>
                        <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-1.5 px-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-rose-500 px-2 h-7 rounded-lg"
                    >
                        <Heart className="h-3.5 w-3.5" />
                        <span>{comment.upvotes > 0 ? comment.upvotes : 'Like'}</span>
                    </Button>
                    {depth < 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsReplying(!isReplying)}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-primary px-2 h-7 rounded-lg"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Reply</span>
                        </Button>
                    )}
                </div>

                {isReplying && isLoggedIn && (
                    <div className="mt-3 flex gap-3 pr-2">
                        <Avatar className="h-6 w-6 border shadow-sm shrink-0 mt-1">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[9px]">
                                {user?.username?.substring(0, 2).toUpperCase() || "ME"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder={`Replying to ${comment.user?.username || "Anonymous"}...`}
                                className="min-h-[60px] text-sm resize-none border-primary/20 focus-visible:ring-primary/30 py-2"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setIsReplying(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-7 text-xs rounded-md shadow-sm px-4"
                                    disabled={!replyText.trim() || replyMutation.isPending}
                                    onClick={() => replyMutation.mutate()}
                                >
                                    {replyMutation.isPending ? "Posting..." : "Reply"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-1 space-y-1">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SinglePostPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isHydrated, isLoggedIn } = useAuth();
    const [commentText, setCommentText] = useState("");

    const id = params.id as string;

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ["post", id],
        queryFn: () => getPostById(id),
    });

    const { data: comments, isLoading: isCommentsLoading } = useQuery({
        queryKey: ["comments", id],
        queryFn: () => getComments(id),
    });

    const { data: bookmarkedIds } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: getUserBookmarks,
        enabled: isLoggedIn,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post deleted successfully");
            router.push("/posts");
        },
        onError: () => {
            toast.error("Failed to delete post");
        },
    });

    const toggleLikeMutation = useMutation({
        mutationFn: () => toggleLike(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", id] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const createCommentMutation = useMutation({
        mutationFn: () => createComment(id, commentText),
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries({ queryKey: ["comments", id] });
            toast.success("Comment posted!");
        },
        onError: () => {
            toast.error("Failed to post comment");
        }
    });

    const toggleBookmarkMutation = useMutation({
        mutationFn: () => toggleBookmark(id),
        onSuccess: (data) => {
            if (data.bookmarked) {
                toast.success("Post bookmarked!");
            } else {
                toast.success("Bookmark removed");
            }
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        }
    });



    if (isLoading) {
        return (
            <div className="container max-w-3xl py-10 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="container max-w-3xl py-20 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-4">Post not found</h2>
                <Button onClick={() => router.push("/posts")}>Back to Discussions</Button>
            </div>
        );
    }

    const isAuthor = isHydrated && user?.username === post.user?.username;

    const totalComments = comments ? comments.reduce((acc: number, curr: Comment) => acc + 1 + (curr.replies?.length || 0), 0) : 0;

    return (
        <div className="container">
            <Link href="/posts" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Feed
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3">
                    <PostCard
                        post={post}
                        isBookmarked={!!bookmarkedIds?.includes(post.id)}
                        onLike={() => toggleLikeMutation.mutate()}
                        isLikePending={toggleLikeMutation.isPending}
                        onBookmark={() => toggleBookmarkMutation.mutate()}
                        isBookmarkPending={toggleBookmarkMutation.isPending}
                        viewMode="detail"
                        isAuthor={isAuthor}
                        onDelete={() => deleteMutation.mutate(id)}
                        isDeletePending={deleteMutation.isPending}
                        commentCount={totalComments}
                    />
                </div>

                <div className="lg:col-span-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto no-scrollbar pb-10">
                    <div className="space-y-6" id="comments">
                        <h3 className="text-lg font-bold px-2">Comments</h3>

                        {isLoggedIn ? (
                            <div className="flex gap-4 p-4 bg-card rounded-2xl border border-primary/20 shadow-sm">
                                <Avatar className="h-9 w-9 border shadow-sm shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {user?.username?.substring(0, 2).toUpperCase() || "ME"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        placeholder="Write a comment..."
                                        className="min-h-[80px] resize-none border-primary/20 focus-visible:ring-primary/30"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            className="rounded-md shadow-sm px-6"
                                            disabled={!commentText.trim() || createCommentMutation.isPending}
                                            onClick={() => createCommentMutation.mutate()}
                                        >
                                            {createCommentMutation.isPending ? "Posting..." : "Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center bg-muted/20 rounded-2xl border border-dashed border-muted">
                                <p className="text-muted-foreground text-sm">Please log in to leave a comment.</p>
                                <Link href="/login">
                                    <Button variant="outline" size="sm" className="mt-4">Login</Button>
                                </Link>
                            </div>
                        )}

                        <div className="space-y-1 divide-y divide-border/30">
                            {isCommentsLoading ? (
                                <div className="space-y-4 pt-4">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : comments && comments.length > 0 ? (
                                comments.map((comment: Comment) => (
                                    <CommentItem key={comment.id} comment={comment} postId={id} />
                                ))
                            ) : (
                                <div className="py-10 text-center">
                                    <p className="text-muted-foreground text-sm">No comments yet. Be the first to reply!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
