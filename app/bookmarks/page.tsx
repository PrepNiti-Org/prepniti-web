"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Post, toggleLike, toggleBookmark, getUserBookmarks, getBookmarkedPosts, getUserLikes } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/features/posts/components/PostCard";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BookmarksPage() {
    const { isLoggedIn } = useAuth();

    const { data: bookmarkedIds } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: getUserBookmarks,
        enabled: isLoggedIn,
    });

    const { data: likedIds } = useQuery({
        queryKey: ["userLikes"],
        queryFn: getUserLikes,
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
            queryClient.invalidateQueries({ queryKey: ["userLikes"] });
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

    if (!isLoggedIn) {
        return (
            <div className="container max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center py-28 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
                        <Bookmark className="h-9 w-9 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">Your Saved Posts</h2>
                    <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-8">
                        Log in to access the posts you've saved. Keep track of great discussions, strategies, and experiences.
                    </p>
                    <Link href="/login">
                        <Button className="font-bold rounded-xl px-8 h-10 shadow-lg shadow-primary/20">
                            Log In to View Bookmarks
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto space-y-8">

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/10 p-8 shadow-sm"
            >
                <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />
                <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-sm shrink-0">
                        <Bookmark className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">Your Bookmarks</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Posts you've saved for later reading and reference.</p>
                    </div>
                </div>
            </motion.div>

            {status === "pending" ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                </div>
            ) : status === "error" ? (
                <div className="text-center py-10 bg-destructive/5 border border-destructive/20 rounded-2xl">
                    <p className="text-destructive font-semibold text-sm">Failed to load bookmarks.</p>
                    <p className="text-muted-foreground text-xs mt-1">Please try refreshing the page.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {data.pages.map((page, i) => (
                        <div key={i} className="space-y-6">
                            {page.data.map((post: Post, index: number) => (
                                <motion.div key={post.id} variants={itemVariants}>
                                    <PostCard
                                        post={post}
                                        isBookmarked={!!bookmarkedIds?.includes(post.id)}
                                        isLiked={!!likedIds?.includes(post.id)}
                                        onLike={() => toggleLikeMutation.mutate(post.id)}
                                        isLikePending={toggleLikeMutation.isPending}
                                        onBookmark={() => toggleBookmarkMutation.mutate(post.id)}
                                        isBookmarkPending={toggleBookmarkMutation.isPending}
                                        viewMode="feed"
                                        delay={index * 0.05}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ))}

                    {data.pages[0].data.length === 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-2xl border border-dashed border-muted"
                        >
                            <div className="relative mb-6">
                                <div className="h-20 w-20 rounded-3xl bg-muted/50 border border-border/40 flex items-center justify-center">
                                    <Bookmark className="h-9 w-9 text-muted-foreground/40" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">No bookmarks yet</h3>
                            <p className="text-muted-foreground text-sm mt-2 max-w-xs leading-relaxed">
                                Tap the bookmark icon on any post to save it here for easy access later.
                            </p>
                            <div className="mt-6">
                                <Link href="/posts">
                                    <Button variant="outline" className="rounded-xl font-semibold">
                                        Explore Posts
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {hasNextPage && (
                        <div className="mt-8 text-center pb-8">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full shadow-sm px-8 font-semibold"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading more...</>
                                ) : "Load More"}
                            </Button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
