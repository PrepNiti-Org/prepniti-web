"use client";

import { useState, useEffect } from "react";
import { Experience, toggleExperienceLike, toggleExperienceBookmark } from "../api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    MessageSquare,
    ShieldCheck,
    User,
    ThumbsUp,
    Bookmark,
    Share2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/ui/markdown-preview";

const getVerdictBadgeStyles = (verdict: string) => {
    switch (verdict.toLowerCase()) {
        case "selected":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-semibold";
        case "rejected":
            return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 font-semibold";
        case "waitlist":
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 font-semibold";
        default:
            return "bg-muted text-muted-foreground border-border font-semibold";
    }
};

const getDifficultyBadgeStyles = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case "easy":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-semibold";
        case "medium":
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 font-semibold";
        case "hard":
            return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 font-semibold";
        default:
            return "bg-muted text-muted-foreground border-border font-semibold";
    }
};

export function PostCard({ post }: { post: Experience }) {
    const isSelected = post.verdict.toLowerCase() === "selected";
    const authorName = post.is_anonymous ? "Anonymous Aspirant" : post.user?.username || "Aspirant";

    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [isLiked, setIsLiked] = useState(!!post.is_liked);
    const [isLiking, setIsLiking] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(!!post.is_bookmarked);
    const [isBookmarking, setIsBookmarking] = useState(false);

    useEffect(() => {
        setLikeCount(post.like_count || 0);
        setIsLiked(!!post.is_liked);
        setIsBookmarked(!!post.is_bookmarked);
    }, [post.like_count, post.is_liked, post.is_bookmarked]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking) return;
        setIsLiking(true);
        try {
            const res = await toggleExperienceLike(post.id);
            setIsLiked(res.liked);
            setLikeCount(res.like_count);
            toast.success(res.liked ? "Marked as helpful!" : "Removed helpful mark");
        } catch (err) {
            toast.error("Failed to update like status");
        } finally {
            setIsLiking(false);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookmarking) return;
        setIsBookmarking(true);
        try {
            const res = await toggleExperienceBookmark(post.id);
            setIsBookmarked(res.bookmarked);
            toast.success(res.bookmarked ? "Saved to bookmarks!" : "Removed from bookmarks");
        } catch {
            toast.error("Failed to update bookmark");
        } finally {
            setIsBookmarking(false);
        }
    };

    const previewCard = (
        <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer group text-left w-full h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                            {post.is_anonymous ? (
                                <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                            ) : (
                                <>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`} />
                                    <AvatarFallback>{authorName[0]}</AvatarFallback>
                                </>
                            )}
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium leading-none">{authorName}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                                {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline" className={`hidden sm:inline-flex ${getVerdictBadgeStyles(post.verdict)}`}>
                        {post.verdict}
                    </Badge>
                </div>

                <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {post.exam_name} ({post.year})
                </h2>

                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${getDifficultyBadgeStyles(post.difficulty)}`}>
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {post.difficulty}
                    </Badge>
                    <Badge variant="outline" className={`sm:hidden text-xs ${getVerdictBadgeStyles(post.verdict)}`}>
                        {post.verdict}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs font-medium hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>Read full experience</span>
                    </div>
                    {likeCount > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                            <ThumbsUp className="h-3.5 w-3.5 fill-muted-foreground/10" />
                            <span>{likeCount}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl h-full">
                    {previewCard}
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">

                <DialogHeader className="p-6 pr-14 pb-5 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border shadow-sm">
                                {post.is_anonymous ? (
                                    <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                                ) : (
                                    <>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`} />
                                        <AvatarFallback>{authorName[0]}</AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <span className="text-base font-semibold">{authorName}</span>
                                <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(post.created_at).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className={`text-sm px-3 py-1 shadow-sm ${getVerdictBadgeStyles(post.verdict)}`}>
                            {post.verdict}
                        </Badge>
                    </div>

                    <DialogTitle className="text-2xl md:text-3xl font-extrabold text-left leading-tight">
                        {post.exam_name} ({post.year})
                    </DialogTitle>

                    <div className="flex items-center gap-2 mt-4">
                        <Badge variant="outline" className={getDifficultyBadgeStyles(post.difficulty)}>
                            {post.difficulty}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto p-6 md:p-8 selection:bg-primary/20">
                    <MarkdownPreview value={post.description} />
                </div>

                <div className="border-t bg-background p-4 px-6 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`transition-colors duration-200 ${isLiked
                                    ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                }`}
                        >
                            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-primary" : ""}`} />
                            {isLiked ? "Helpful" : "Mark Helpful"} {likeCount > 0 && `(${likeCount})`}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`transition-colors ${isBookmarked ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={handleBookmark}
                            disabled={isBookmarking}
                        >
                            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary" : ""}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied to clipboard!");
                            }}
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}