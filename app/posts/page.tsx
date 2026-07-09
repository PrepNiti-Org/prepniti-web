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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(20, "Content must be at least 20 characters").max(5000, "Content is too long"),
    tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

export default function PostsPage() {
    const { isLoggedIn, user } = useAuth();
    const queryClient = useQueryClient();

    // Filtering & Sorting States
    const [feedFilter, setFeedFilter] = useState<"all" | "mine" | "bookmarked">("all");
    const [selectedTag, setSelectedTag] = useState<string>("");
    const [searchVal, setSearchVal] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");

    // Modal Create Post States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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
        queryKey: ["posts", feedFilter, selectedTag, debouncedSearch, sortBy],
        queryFn: ({ pageParam = 1 }) => {
            if (feedFilter === "bookmarked") {
                return getBookmarkedPosts({ pageParam });
            }
            return getPosts({
                pageParam,
                tag: selectedTag || undefined,
                search: debouncedSearch || undefined,
                userId: feedFilter === "mine" && user?.id ? String(user.id) : undefined,
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

    // Create post Form hook
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: [],
        },
    });

    const watchedTags = form.watch("tags");

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post created successfully!");
            setIsCreateOpen(false);
            form.reset();
            setMediaFile(null);
            setMediaPreview(null);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create post");
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let mediaUrl;
            let mediaType;

            if (mediaFile) {
                setIsUploading(true);
                const uploadRes = await uploadMedia(mediaFile);
                mediaUrl = uploadRes.url;
                mediaType = uploadRes.type;
                setIsUploading(false);
            }

            createPostMutation.mutate({
                ...values,
                media_url: mediaUrl,
                media_type: mediaType,
            });
        } catch {
            toast.error("Failed to upload media");
            setIsUploading(false);
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = tagInput.trim().toLowerCase();
            const currentTags = form.getValues("tags");

            if (val && !currentTags.includes(val) && currentTags.length < 5) {
                form.setValue("tags", [...currentTags, val]);
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags");
        form.setValue("tags", currentTags.filter((t) => t !== tagToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
    };

    const triggerCreateModal = () => {
        if (!isLoggedIn) {
            toast.error("Please log in to start a discussion.");
            return;
        }
        setIsCreateOpen(true);
    };

    return (
        <div className="container max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3 space-y-5">

                    {/* Quick Inline Creation Card */}
                    <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm p-0 gap-0">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Avatar className="h-9 w-9 border border-border shadow-sm shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                        {isLoggedIn && user?.username ? user.username.substring(0, 2).toUpperCase() : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    onClick={triggerCreateModal}
                                    className="flex-1 w-full bg-muted/40 hover:bg-muted/70 transition-all rounded-xl px-4 py-2.5 text-muted-foreground text-sm cursor-pointer border border-transparent hover:border-primary/20"
                                >
                                    {isLoggedIn
                                        ? `Share a question, strategy, or resource, @${user?.username}...`
                                        : "Start a discussion or ask the community..."}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/30">
                                <div className="flex items-center gap-1 ml-12">
                                    <Button onClick={triggerCreateModal} variant="ghost" size="sm" className="text-muted-foreground hover:text-emerald-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold cursor-pointer">
                                        <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="hidden sm:inline">Photo</span>
                                    </Button>
                                    <Button onClick={triggerCreateModal} variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold cursor-pointer">
                                        <Video className="h-3.5 w-3.5 text-rose-500" />
                                        <span className="hidden sm:inline">Video</span>
                                    </Button>
                                    <Button onClick={triggerCreateModal} variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 gap-1.5 px-2 rounded-lg h-8 text-xs font-semibold cursor-pointer">
                                        <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="hidden sm:inline">Poll</span>
                                    </Button>
                                </div>
                                <Button onClick={triggerCreateModal} size="sm" className="rounded-lg px-5 font-bold shadow-sm text-xs h-8 gap-1.5 cursor-pointer">
                                    <PenSquare className="h-3.5 w-3.5" />
                                    Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Segmented Feed Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-2">
                        <div className="flex bg-muted p-1 rounded-xl shrink-0 w-full sm:w-fit border border-border/20">
                            <Button
                                variant={feedFilter === "all" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => {
                                    setFeedFilter("all");
                                    setSelectedTag("");
                                }}
                                className="flex-1 text-xs font-bold py-1 rounded-lg h-7 px-4 cursor-pointer"
                            >
                                All Feed
                            </Button>
                            {isLoggedIn && (
                                <>
                                    <Button
                                        variant={feedFilter === "mine" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => {
                                            setFeedFilter("mine");
                                            setSelectedTag("");
                                        }}
                                        className="flex-1 text-xs font-bold py-1 rounded-lg h-7 px-4 cursor-pointer"
                                    >
                                        My Posts
                                    </Button>
                                    <Button
                                        variant={feedFilter === "bookmarked" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => {
                                            setFeedFilter("bookmarked");
                                            setSelectedTag("");
                                        }}
                                        className="flex-1 text-xs font-bold py-1 rounded-lg h-7 px-4 cursor-pointer"
                                    >
                                        Bookmarks
                                    </Button>
                                </>
                            )}
                        </div>

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
                                <SelectTrigger className="h-8.5 text-xs w-[110px] rounded-xl bg-card border-border/60 cursor-pointer">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest" className="cursor-pointer">Newest</SelectItem>
                                    <SelectItem value="popular" className="cursor-pointer">Popular</SelectItem>
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
                                        <Button onClick={triggerCreateModal} size="sm" className="mt-4 rounded-xl font-bold gap-1.5 cursor-pointer">
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

            {/* Inline Create Post Dialog Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                    <DialogHeader className="pb-4 border-b border-border/40">
                        <DialogTitle className="text-xl font-bold tracking-tight">Create a New Discussion</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Share questions, preparation strategies, or notes with other aspirants.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-4">
                        {/* <div className="bg-primary/[0.03] border border-primary/10 rounded-xl p-3 flex gap-3 items-start">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-foreground">Tips for a great post</h4>
                                <p className="text-[10px] text-muted-foreground leading-normal">
                                    Write a descriptive title, provide details/examples, and select relevant tags. Let's keep discussions respectful and exam-focused.
                                </p>
                            </div>
                        </div> */}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="What is on your mind?"
                                                    className="text-sm py-4.5 rounded-xl border border-border/70 focus-visible:ring-primary/30"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Content</FormLabel>
                                            <FormControl>
                                                <MarkdownEditor
                                                    placeholder="Provide details, context, and examples (Markdown supported)..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="border border-border/70 focus-within:ring-primary/30 min-h-[160px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Media Attachment Zone */}
                                <div className="space-y-2">
                                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attach Media (Optional)</FormLabel>
                                    {!mediaFile ? (
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="modal-dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 border-border/60 hover:border-primary/45 hover:bg-muted/20 transition-all duration-200">
                                                <div className="flex flex-col items-center justify-center pt-3 pb-3 text-muted-foreground text-center">
                                                    <UploadCloud className="w-6 h-6 mb-1.5 text-primary/70" />
                                                    <p className="text-xs"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Images, GIFs, MP4 (Max 10MB)</p>
                                                </div>
                                                <Input id="modal-dropzone-file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-border bg-card">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full shadow-md cursor-pointer"
                                                onClick={removeMedia}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                            {mediaFile.type.startsWith("image/") ? (
                                                <img src={mediaPreview!} alt="Preview" className="w-full h-auto max-h-[180px] object-contain bg-black/5" />
                                            ) : (
                                                <video src={mediaPreview!} controls className="w-full h-auto max-h-[180px] bg-black/5" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={() => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags</FormLabel>
                                                <span className="text-[10px] text-muted-foreground">Press Enter/comma to add • {5 - watchedTags.length} remaining</span>
                                            </div>
                                            <FormControl>
                                                <div className="space-y-2.5">
                                                    <Input
                                                        placeholder="e.g. strategy, upsc, maths"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        disabled={watchedTags.length >= 5}
                                                        className="rounded-xl border border-border/70 focus-visible:ring-primary/30"
                                                    />
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <AnimatePresence>
                                                            {watchedTags.map((tag) => (
                                                                <motion.div
                                                                    key={tag}
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                                >
                                                                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs rounded-full flex items-center space-x-1 font-semibold bg-muted text-foreground border border-border/50">
                                                                        <span>#{tag}</span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removeTag(tag)}
                                                                            className="h-3.5 w-3.5 p-0 ml-1 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                                                                        >
                                                                            <X className="h-2.5 w-2.5" />
                                                                        </Button>
                                                                    </Badge>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-3 border-t border-border/30 flex justify-end gap-2.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="rounded-xl text-xs h-9 cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createPostMutation.isPending || isUploading}
                                        className="rounded-xl text-xs h-9 px-5 font-bold shadow-sm cursor-pointer"
                                    >
                                        {createPostMutation.isPending || isUploading ? (
                                            <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                {isUploading ? "Uploading..." : "Publishing..."}
                                            </>
                                        ) : (
                                            "Publish Post"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
