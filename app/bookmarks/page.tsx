"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Post, toggleLike, toggleBookmark, getUserBookmarks, getBookmarkedPosts } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Heart, MessageCircle, Send, MoreHorizontal, Image as ImageIcon, Video, BarChart2, TrendingUp, UserPlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function BookmarksPage() {
    const { isLoggedIn } = useAuth();

    const { data: bookmarkedIds } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: getUserBookmarks,
        enabled: isLoggedIn,
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["bookmarkedPosts"],
        queryFn: getBookmarkedPosts,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: isLoggedIn,
    });

    const queryClient = useQueryClient();

    const toggleLikeMutation = useMutation({
        mutationFn: (postId: string) => toggleLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const toggleBookmarkMutation = useMutation({
        mutationFn: (postId: string) => toggleBookmark(postId),
        onSuccess: (data) => {
            if (data.bookmarked) {
                toast.success("Post bookmarked!");
            } else {
                toast.success("Bookmark removed");
            }
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const handleShare = (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        const url = `${window.location.origin}/posts/${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="container py-20 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Please log in to view bookmarks</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    You need to be logged in to see the posts you've saved.
                </p>
                <div className="mt-6">
                    <Link href="/login">
                        <Button>Log In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                <Bookmark className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Bookmarks</h1>
                    <p className="text-sm text-muted-foreground">Posts you've saved for later</p>
                </div>
            </div>

            {/* Feed Skeleton */}
            {status === "pending" ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                </div>
            ) : status === "error" ? (
                <div className="text-center py-10 bg-destructive/10 rounded-xl">
                    <p className="text-destructive font-medium">Failed to load bookmarks. Please try again.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.pages.map((page, i) => (
                        <div key={i} className="space-y-6">
                            {page.data.map((post: Post, index: number) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-md transition-all duration-300 border-primary/40 overflow-hidden bg-card rounded-xl">
                                        <CardHeader className="p-5 pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                            {post.user?.username ? post.user.username.substring(0, 2).toUpperCase() : "AN"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="text-sm font-bold leading-none text-foreground hover:underline cursor-pointer">
                                                            {post.user?.username || "Anonymous"}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full -mt-1 -mr-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <Link href={`/posts/${post.id}`}>
                                            <CardContent className="px-5 pb-3 cursor-pointer">
                                                <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                                    {post.content}
                                                </p>
                                                {post.media_url && (
                                                    <div className="mt-3 rounded-xl overflow-hidden border border-border bg-muted/10">
                                                        {post.media_type === "video" ? (
                                                            <video src={`http://localhost:8080${post.media_url}`} controls className="w-full max-h-[400px] bg-black/5" />
                                                        ) : (
                                                            <img src={`http://localhost:8080${post.media_url}`} alt="Post Media" className="w-full max-h-[400px] object-cover bg-black/5" />
                                                        )}
                                                    </div>
                                                )}

                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {post.tags.map(tag => (
                                                            <span key={tag} className="text-sm font-semibold text-primary/80 hover:text-primary hover:underline">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Link>
                                        <CardFooter className="px-5 py-3 border-t border-muted/20">
                                            <div className="flex items-center justify-between w-full text-muted-foreground">
                                                <div className="flex items-center gap-6">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleLikeMutation.mutate(post.id);
                                                        }}
                                                        className="flex items-center gap-2 hover:text-rose-500 transition-colors group"
                                                        disabled={toggleLikeMutation.isPending}
                                                    >
                                                        <Heart className="h-5 w-5 group-hover:fill-rose-500/20" />
                                                        <span className="text-sm font-medium">{post.upvotes > 0 ? post.upvotes : 'Like'}</span>
                                                    </button>
                                                    <Link href={`/posts/${post.id}`}>
                                                        <button className="flex items-center gap-2 hover:text-primary transition-colors group">
                                                            <MessageCircle className="h-5 w-5 group-hover:fill-primary/20" />
                                                            <span className="text-sm font-medium">Discuss</span>
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={(e) => handleShare(e, post.id)}
                                                        className="flex items-center gap-2 hover:text-primary transition-colors"
                                                    >
                                                        <Send className="h-5 w-5" />
                                                        <span className="text-sm font-medium">Share</span>
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleBookmarkMutation.mutate(post.id);
                                                    }}
                                                    disabled={toggleBookmarkMutation.isPending}
                                                    className="hover:text-primary transition-colors group"
                                                >
                                                    <Bookmark className={`h-5 w-5 ${bookmarkedIds?.includes(post.id) ? 'fill-primary text-primary' : 'group-hover:fill-primary/20'}`} />
                                                </button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ))}

                    {data.pages[0].data.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted">
                            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold">No bookmarks yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Save interesting posts to easily find them later!
                            </p>
                            <div className="mt-6">
                                <Link href="/posts">
                                    <Button variant="outline">Explore Posts</Button>
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
                                {isFetchingNextPage ? "Loading more..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
