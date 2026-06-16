"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPosts, Post, toggleLike, toggleBookmark, getUserBookmarks } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Image as ImageIcon, Video, BarChart2, TrendingUp, UserPlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/features/posts/components/PostCard";

export default function PostsPage() {
    const { isLoggedIn, user } = useAuth();

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
        queryKey: ["posts"],
        queryFn: getPosts,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const queryClient = useQueryClient();

    const toggleLikeMutation = useMutation({
        mutationFn: (postId: string) => toggleLike(postId),
        onSuccess: () => {
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
        }
    });

    return (
        <div className="container max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3 space-y-6">

                    <Card className="border-primary/40 shadow-sm rounded-xl overflow-hidden bg-card">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex gap-4 mb-4">
                                <Avatar className="h-10 w-10 border shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">ME</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Link href="/posts/create" className="block">
                                        <div className="w-full bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl px-4 py-3 text-muted-foreground text-sm cursor-text border border-transparent hover:border-border">
                                            Start a discussion or ask for help...
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1 sm:gap-4 ml-[56px]">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 px-2 sm:px-3 rounded-full h-9">
                                        <ImageIcon className="h-4 w-4 text-emerald-500" />
                                        <span className="hidden sm:inline-block text-xs font-medium">Photo</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 px-2 sm:px-3 rounded-full h-9">
                                        <Video className="h-4 w-4 text-rose-500" />
                                        <span className="hidden sm:inline-block text-xs font-medium">Video</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 px-2 sm:px-3 rounded-full h-9">
                                        <BarChart2 className="h-4 w-4 text-blue-500" />
                                        <span className="hidden sm:inline-block text-xs font-medium">Poll</span>
                                    </Button>
                                </div>
                                <Link href="/posts/create">
                                    <Button size="sm" className="rounded-md px-6 shadow-sm">
                                        Post
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {status === "pending" ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : status === "error" ? (
                        <div className="text-center py-10 bg-destructive/10 rounded-xl">
                            <p className="text-destructive font-medium">Failed to load posts. Please try again.</p>
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
                                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                    <h3 className="text-xl font-semibold">No discussions yet</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                        Be the first to start a conversation in the PrepNiti community!
                                    </p>
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
                                        {isFetchingNextPage ? "Loading more..." : "Load More Discussions"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Column */}
                <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 h-fit">

                    {isLoggedIn ? (
                        <Card className="border-primary/40 shadow-sm rounded-xl bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                            {user?.username ? user.username.substring(0, 2).toUpperCase() : "ME"}
                                        </AvatarFallback>
                                    </Avatar>
                                    Your Dashboard
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">@{user?.username}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                                </div>
                                <div className="pt-2 border-t space-y-2">
                                    <Link href="/profile" className="block text-xs font-semibold text-primary hover:underline">
                                        View Profile Stats
                                    </Link>
                                    <Link href="/submit" className="block text-xs font-semibold text-primary hover:underline">
                                        Share an Experience
                                    </Link>
                                    <Link href="/tracker" className="block text-xs font-semibold text-primary hover:underline">
                                        Study Target Tracker
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-primary/40 shadow-sm rounded-xl bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Join PrepNiti</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Create posts, track syllabus completion progress, and benchmark your scores.
                                </p>
                                <Link href="/login" className="block">
                                    <Button size="sm" className="w-full text-xs font-semibold">
                                        Log In / Register
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer Links */}
                    <div className="px-2 pt-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-muted-foreground/70">
                            <Link href="/about" className="hover:underline hover:text-primary transition-colors">About</Link>
                            <Link href="/help" className="hover:underline hover:text-primary transition-colors">Help Center</Link>
                            <Link href="/privacy" className="hover:underline hover:text-primary transition-colors">Privacy & Terms</Link>
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 mt-3">
                            PrepNiti © 2026
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
