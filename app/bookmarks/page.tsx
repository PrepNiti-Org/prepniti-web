"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Post, toggleLike, toggleBookmark, getUserBookmarks, getBookmarkedPosts } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/features/posts/components/PostCard";

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
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    isBookmarked={!!bookmarkedIds?.includes(post.id)}
                                    onLike={() => toggleLikeMutation.mutate(post.id)}
                                    isLikePending={toggleLikeMutation.isPending}
                                    onBookmark={() => toggleBookmarkMutation.mutate(post.id)}
                                    isBookmarkPending={toggleBookmarkMutation.isPending}
                                    viewMode="feed"
                                    delay={index * 0.05}
                                />
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
