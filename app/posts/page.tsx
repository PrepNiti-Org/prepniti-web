"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPosts, Post, toggleLike, toggleBookmark, getUserBookmarks } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image as ImageIcon, Video, BarChart2, TrendingUp, UserPlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dummy data for right sidebar
const trendingTopics = [
    { tag: "#JEE2024", posts: "12.4k" },
    { tag: "#PhysicsHelp", posts: "8.1k" },
    { tag: "#NEET2024", posts: "7.2k" },
    { tag: "#MathShortcuts", posts: "4.9k" },
];

const studyBuddies = [
    { name: "Siddharth V.", match: "98% Match in Math", initial: "SV" },
    { name: "Kriti P.", match: "Top Ranker in Bio", initial: "KP" },
    { name: "Aryan R.", match: "Nearby (2km away)", initial: "AR" },
];

export default function PostsPage() {
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

    const handleShare = (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        const url = `${window.location.origin}/posts/${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    return (
        <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">

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

                    {/* Trending Topics Widget */}
                    <Card className="border-primary/40 shadow-sm rounded-xl bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {trendingTopics.map((topic, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">
                                        {topic.tag}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary hover:bg-primary/20 border-transparent">
                                        {topic.posts} posts
                                    </Badge>
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <Link href="/explore" className="text-xs font-bold text-secondary hover:underline">
                                    Show more
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Study Buddies Widget */}
                    <Card className="border-primary/40 shadow-sm rounded-xl bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-primary" />
                                Study Buddies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {studyBuddies.map((buddy, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border shadow-sm">
                                            <AvatarFallback className="bg-muted text-xs font-semibold">
                                                {buddy.initial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold leading-tight hover:underline cursor-pointer">
                                                {buddy.name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {buddy.match}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary hover:text-primary hover:bg-primary/10">
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                            <div className="pt-1 text-center">
                                <Link href="/buddies" className="text-xs font-bold text-secondary hover:underline">
                                    Find more peers
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

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
