"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    getPosts,
    Post,
    toggleLike,
    toggleBookmark,
    getUserBookmarks,
    getUserLikes,
    getBookmarkedPosts,
    createPost,
    uploadMedia
} from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MessageSquare, Image as ImageIcon, Video, BarChart2, TrendingUp,
    PlusCircle, Loader2, Sparkles, Target, BookOpen, ArrowUpRight,
    GraduationCap, FileText, PenSquare, Search, X, UploadCloud, Info, Heart
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/features/posts/components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
    { href: "/tracker", icon: Target, label: "Study Tracker", desc: "Manage your targets", color: "text-violet-500", bg: "bg-violet-500/10" },
    { href: "/mock-tests", icon: GraduationCap, label: "Mock Tests", desc: "Take a full-length test", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { href: "/insights", icon: BarChart2, label: "Insights", desc: "Analytics & charts", color: "text-blue-500", bg: "bg-blue-500/10" },
    { href: "/bookmarks", icon: BookOpen, label: "Bookmarks", desc: "Saved posts", color: "text-amber-500", bg: "bg-amber-500/10" },
];

const POPULAR_TAGS = [
    "strategy",
    "mock-tests",
    "notes",
    "dsa",
    "syllabus",
    "schedule",
    "general",
    "maths",
    "physics"
];

export default function PostsPage() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Filtering & Sorting States
    const [selectedTag, setSelectedTag] = useState<string>("");
    const [searchVal, setSearchVal] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("feed");

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchVal);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchVal]);

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

    // Infinite Query with filters
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ["posts", selectedTag, debouncedSearch, sortBy],
        queryFn: ({ pageParam = 1 }) => {
            return getPosts({
                pageParam,
                tag: selectedTag || undefined,
                search: debouncedSearch || undefined,
                sort: sortBy,
            });
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

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

    const triggerCreateModal = (initialTag?: string) => {
        if (!isLoggedIn) {
            toast.error("Please log in to start a discussion.");
            return;
        }
        if (initialTag) {
            router.push(`/posts/create?tag=${encodeURIComponent(initialTag)}`);
        } else {
            router.push("/posts/create");
        }
    };

    const avatarUrl = user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : "";
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "?";

    return (
        <div className="container max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 
                <div className="lg:col-span-3 space-y-5">
 
                    {/* Quick Inline Creation Card */}
                    <Card className="border border-border/60 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-md shadow-sm p-4 hover:border-primary/20 transition-all duration-300">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Avatar className="h-9 w-9 border border-border shadow-sm shrink-0">
                                    {isLoggedIn && <AvatarImage src={avatarUrl} alt={user?.username} />}
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    onClick={() => triggerCreateModal()}
                                    className="flex-1 w-full bg-muted/40 hover:bg-muted/70 transition-all rounded-xl px-4 py-2 text-muted-foreground text-sm cursor-pointer border border-border/30 hover:border-primary/20 flex items-center"
                                >
                                    {isLoggedIn
                                        ? `Share a question, strategy, or resource, @${user?.username}...`
                                        : "Start a discussion or ask the community..."}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/30">
                                <div className="flex items-center gap-1.5">
                                    <Button 
                                        onClick={() => triggerCreateModal("query")} 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 gap-1.5 px-3 rounded-xl h-8 text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Ask Query</span>
                                    </Button>
                                    <Button 
                                        onClick={() => triggerCreateModal("strategy")} 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 gap-1.5 px-3 rounded-xl h-8 text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        <Target className="h-3.5 w-3.5 text-indigo-500" />
                                        <span>Share Strategy</span>
                                    </Button>
                                    <Button 
                                        onClick={() => triggerCreateModal("notes")} 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 gap-1.5 px-3 rounded-xl h-8 text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Add Notes</span>
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => triggerCreateModal()} 
                                    size="sm" 
                                    className="rounded-xl px-5 font-bold shadow-sm text-xs h-8 gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground ml-auto"
                                >
                                    <PenSquare className="h-3.5 w-3.5" />
                                    Post
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Discussions Feed Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/50 pb-2">
                        <h2 className="text-lg font-bold text-foreground self-start sm:self-center">
                            Discussions
                        </h2>

                        {/* Search & Sort Panel */}
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search discussions..."
                                    value={searchVal}
                                    onChange={e => setSearchVal(e.target.value)}
                                    className="pl-8 h-8.5 text-xs rounded-xl bg-card border-border/60"
                                />
                                {searchVal && (
                                    <button
                                        onClick={() => setSearchVal("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="h-8.5 text-xs w-[120px] rounded-xl bg-card border-border/60 cursor-pointer">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feed" className="cursor-pointer">Trending</SelectItem>
                                    <SelectItem value="newest" className="cursor-pointer">Latest</SelectItem>
                                    <SelectItem value="popular" className="cursor-pointer">Top (7 days)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tag Pills List */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                        <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0 mr-1 hidden sm:block" />
                        <Badge
                            variant={!selectedTag ? "default" : "secondary"}
                            onClick={() => setSelectedTag("")}
                            className={cn(
                                "cursor-pointer text-[10px] font-semibold py-0.5 px-3 rounded-full border border-border/40 select-none whitespace-nowrap",
                                !selectedTag ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                            )}
                        >
                            #all
                        </Badge>
                        {POPULAR_TAGS.map(tag => {
                            const isSelected = selectedTag === tag;
                            return (
                                <Badge
                                    key={tag}
                                    variant={isSelected ? "default" : "secondary"}
                                    onClick={() => setSelectedTag(isSelected ? "" : tag)}
                                    className={cn(
                                        "cursor-pointer text-[10px] font-semibold py-0.5 px-3 rounded-full border border-border/40 select-none whitespace-nowrap transition-all",
                                        isSelected ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    #{tag}
                                </Badge>
                            );
                        })}
                    </div>

                    {/* Discussions Feed List */}
                    {status === "pending" ? (
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : status === "error" ? (
                        <div className="text-center py-10 bg-destructive/5 border border-destructive/20 rounded-2xl">
                            <p className="text-destructive font-semibold text-sm">Failed to load posts.</p>
                            <p className="text-muted-foreground text-xs mt-1">Please try again or refresh.</p>
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
                                            delay={index * 0.03}
                                        />
                                    ))}
                                </div>
                            ))}

                            {data.pages[0].data.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-border/60">
                                    <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center mb-4 text-muted-foreground/50">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">No discussions found</h3>
                                    <p className="text-muted-foreground text-xs mt-1 max-w-xs">
                                        {searchVal || selectedTag
                                            ? "Try updating your search terms or clearing tag filters."
                                            : "Be the first to start a conversation in the PrepNiti community!"}
                                    </p>
                                    {(searchVal || selectedTag) ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSearchVal("");
                                                setSelectedTag("");
                                            }}
                                            className="mt-4 rounded-xl text-xs font-semibold cursor-pointer"
                                        >
                                            Clear Filters
                                        </Button>
                                    ) : (
                                        <Button onClick={() => triggerCreateModal()} size="sm" className="mt-4 rounded-xl font-bold gap-1.5 cursor-pointer">
                                            <PlusCircle className="h-4 w-4" /> Start a discussion
                                        </Button>
                                    )}
                                </div>
                            )}

                            {hasNextPage && (
                                <div className="mt-6 text-center pb-8">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="rounded-full shadow-sm px-8 font-semibold cursor-pointer"
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

                {/* Right Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-1 space-y-5 sticky top-20 h-fit">

                    {isLoggedIn ? (
                        <Card className="border-primary/20 shadow-sm rounded-2xl overflow-hidden bg-card p-0 gap-0">
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
                        <Card className="border-primary/20 shadow-sm rounded-2xl overflow-hidden bg-card p-0 gap-0">
                            <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-violet-500/10 p-5 border-b border-border/30">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative flex items-center gap-2 mb-1">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-bold">Join PrepNiti</CardTitle>
                                </div>
                                <p className="text-xs text-muted-foreground">Anonymous. Free. Powerful.</p>
                            </div>
                            <CardContent className="p-4">
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
