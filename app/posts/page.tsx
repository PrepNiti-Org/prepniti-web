"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPosts, Post, toggleLike, toggleBookmark, getUserBookmarks, getUserLikes } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare, Image as ImageIcon, Video, BarChart2, TrendingUp,
    PlusCircle, Loader2, Sparkles, Target, BookOpen, ArrowUpRight,
    GraduationCap, FileText, PenSquare
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/features/posts/components/PostCard";
import { motion } from "framer-motion";

const QUICK_LINKS = [
    { href: "/tracker", icon: Target, label: "Study Tracker", desc: "Manage your targets", color: "text-violet-500", bg: "bg-violet-500/10" },
    { href: "/mock-tests", icon: GraduationCap, label: "Mock Tests", desc: "Take a full-length test", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { href: "/insights", icon: BarChart2, label: "Insights", desc: "Analytics & charts", color: "text-blue-500", bg: "bg-blue-500/10" },
    { href: "/bookmarks", icon: BookOpen, label: "Bookmarks", desc: "Saved posts", color: "text-amber-500", bg: "bg-amber-500/10" },
];

export default function PostsPage() {
    const { isLoggedIn, user } = useAuth();

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
        }
    });

    return (
        <div className="container max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3 space-y-5">

                    <Card className="border-primary/20 shadow-sm rounded-2xl overflow-hidden bg-card">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Avatar className="h-9 w-9 border border-border shadow-sm shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                        {isLoggedIn && user?.username ? user.username.substring(0, 2).toUpperCase() : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <Link href="/posts/create" className="flex-1">
                                    <div className="w-full bg-muted/40 hover:bg-muted/70 transition-all rounded-xl px-4 py-2.5 text-muted-foreground text-sm cursor-text border border-transparent hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary/30">
                                        {isLoggedIn
                                            ? `Share a question, strategy, or resource, @${user?.username}...`
                                            : "Start a discussion or ask the community..."}
                                    </div>
                                </Link>
                            </div>
                            <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/30">
                                <div className="flex items-center gap-1 ml-12">
                                    <Link href="/posts/create">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-emerald-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold">
                                            <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                                            <span className="hidden sm:inline">Photo</span>
                                        </Button>
                                    </Link>
                                    <Link href="/posts/create">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold">
                                            <Video className="h-3.5 w-3.5 text-rose-500" />
                                            <span className="hidden sm:inline">Video</span>
                                        </Button>
                                    </Link>
                                    <Link href="/posts/create">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold">
                                            <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="hidden sm:inline">Poll</span>
                                        </Button>
                                    </Link>
                                </div>
                                <Link href="/posts/create">
                                    <Button size="sm" className="rounded-lg px-5 font-bold shadow-sm text-xs h-8 gap-1.5">
                                        <PenSquare className="h-3.5 w-3.5" />
                                        Post
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-2 px-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">Recent Discussions</h2>
                        <div className="flex-1 h-px bg-border/40 ml-2" />
                    </div>

                    {status === "pending" ? (
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : status === "error" ? (
                        <div className="text-center py-10 bg-destructive/5 border border-destructive/20 rounded-2xl">
                            <p className="text-destructive font-semibold text-sm">Failed to load posts.</p>
                            <p className="text-muted-foreground text-xs mt-1">Please refresh the page.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {data.pages.map((page, i) => (
                                <div key={i} className="space-y-5">
                                    {page.data.map((post: Post, index: number) => (
                                        <PostCard
                                            key={post.id}
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
                                    ))}
                                </div>
                            ))}

                            {data.pages[0].data.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-2xl border border-dashed border-muted">
                                    <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mb-4">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-base font-bold">No discussions yet</h3>
                                    <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                                        Be the first to start a conversation in the PrepNiti community!
                                    </p>
                                    <Link href="/posts/create" className="mt-4">
                                        <Button size="sm" className="rounded-xl font-semibold gap-1.5">
                                            <PlusCircle className="h-4 w-4" /> Start a discussion
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {hasNextPage && (
                                <div className="mt-6 text-center pb-8">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="rounded-full shadow-sm px-8 font-semibold"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                    >
                                        {isFetchingNextPage ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</>
                                        ) : "Load More Discussions"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="hidden lg:block lg:col-span-1 space-y-5 sticky top-20 h-fit">

                    {isLoggedIn ? (
                        <Card className="border-primary/20 shadow-sm rounded-2xl overflow-hidden bg-card">
                            <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-violet-500/10 p-4 border-b border-border/30">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                        <AvatarFallback className="bg-primary/20 text-primary font-black text-sm">
                                            {user?.username ? user.username.substring(0, 2).toUpperCase() : "ME"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-foreground truncate">@{user?.username}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                {QUICK_LINKS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group"
                                    >
                                        <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-primary/20 shadow-sm rounded-2xl overflow-hidden bg-card">
                            <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-violet-500/10 p-5 border-b border-border/30">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative flex items-center gap-2 mb-1">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-bold">Join PrepNiti</CardTitle>
                                </div>
                                <p className="text-xs text-muted-foreground">Anonymous. Free. Powerful.</p>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    {[
                                        { icon: FileText, text: "Post & discuss anonymously" },
                                        { icon: GraduationCap, text: "Access full mock tests" },
                                        { icon: Target, text: "Track your study targets" },
                                    ].map((f) => (
                                        <div key={f.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <f.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                            {f.text}
                                        </div>
                                    ))}
                                </div>
                                <Link href="/register" className="block">
                                    <Button size="sm" className="w-full font-bold rounded-xl text-xs h-9 shadow-sm shadow-primary/10">
                                        Sign up — it's free
                                    </Button>
                                </Link>
                                <Link href="/login" className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Already have an account? Log in
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    <div className="px-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground/60">
                            <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
                            <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
                            <Link href="/feedback" className="hover:text-muted-foreground transition-colors">Feedback</Link>
                        </div>
                        <p className="text-[11px] text-muted-foreground/40 mt-2">PrepNiti © {new Date().getFullYear()}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
