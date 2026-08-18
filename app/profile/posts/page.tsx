"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserExperiences } from "@/features/profile/api";
import { getPosts, deletePost, Post } from "@/features/posts/api";
import { deleteExperience, Experience } from "@/features/experiences/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Calendar, FileText, MessageSquare, ArrowUpRight, Pencil, Trash2, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { EditExperienceModal } from "@/features/experiences/components/EditExperienceModal";
import { EditPostModal } from "@/features/posts/components/EditPostModal";
import { MarkdownPreview } from "@/components/ui/markdown-preview";

export default function MyPostsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"experiences" | "discussions">("experiences");
    const [previewExp, setPreviewExp] = useState<Experience | null>(null);

    const { data: experiences, isLoading: isExperiencesLoading } = useQuery({
        queryKey: ["my-experiences"],
        queryFn: getUserExperiences,
    });

    const { data: discussionsData, isLoading: isDiscussionsLoading } = useQuery({
        queryKey: ["my-discussions", user?.id],
        queryFn: () => getPosts({ userId: String(user?.id) }),
        enabled: !!user?.id,
    });

    const deleteExpMutation = useMutation({
        mutationFn: deleteExperience,
        onSuccess: () => {
            toast.success("Experience deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
            queryClient.invalidateQueries({ queryKey: ["experiences-feed"] });
            queryClient.invalidateQueries({ queryKey: ["experiences"] });
            queryClient.invalidateQueries({ queryKey: ["profile-activity"] });
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => {
            toast.error(err.response?.data?.error || "Failed to delete experience");
        },
    });

    const deletePostMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["my-discussions"] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["profile-activity"] });
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => {
            toast.error(err.response?.data?.error || "Failed to delete post");
        },
    });

    const isLoading = isExperiencesLoading || isDiscussionsLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    const discussions = discussionsData?.data || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center gap-4 mb-8">
                <Link href="/profile">
                    <Button variant="outline" size="icon" className="rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Contributions</h1>
                    <p className="text-muted-foreground mt-1">
                        Review, edit, or manage all the posts and interview reviews you&apos;ve shared.
                    </p>
                </div>
            </div>

            {/* Premium Tabs Selector */}
            <div className="flex border-b border-border/50 pb-px mb-6">
                <button
                    onClick={() => setActiveTab("experiences")}
                    className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all cursor-pointer ${
                        activeTab === "experiences"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Interview Experiences ({experiences?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab("discussions")}
                    className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all cursor-pointer ${
                        activeTab === "discussions"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Discussions (Posts) ({discussions.length})
                </button>
            </div>

            {activeTab === "experiences" ? (
                <>
                    {(!experiences || experiences.length === 0) && (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No experiences yet</h3>
                            <p className="text-muted-foreground mt-1 mb-4">
                                You haven&apos;t shared any interview experiences.
                            </p>
                            <Link href="/submit">
                                <Button className="rounded-xl">Share an Experience</Button>
                            </Link>
                        </div>
                    )}

                    <div className="space-y-4">
                        {experiences?.map((post, index) => {
                            const expItem: Experience = {
                                id: post.id,
                                exam_name: post.exam_name,
                                year: post.year,
                                verdict: post.verdict,
                                difficulty: post.difficulty,
                                description: post.description,
                                is_anonymous: !!post.is_anonymous,
                                created_at: post.created_at,
                                user_id: post.user_id || (user?.id ? String(user.id) : ""),
                            };

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:border-primary/50 transition-colors rounded-xl border border-border/60">
                                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl">{post.exam_name} ({post.year})</CardTitle>
                                                <div className="flex items-center text-sm text-muted-foreground mt-2 gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <Badge variant={post.verdict === "Selected" ? "default" : "secondary"}>
                                                    {post.verdict}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {post.difficulty}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm line-clamp-3 text-muted-foreground leading-relaxed">
                                                {post.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPreviewExp(expItem)}
                                                    className="h-8 text-xs text-muted-foreground hover:text-primary gap-1 px-2.5"
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> View Details
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    <EditExperienceModal
                                                        post={expItem}
                                                        trigger={
                                                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                                                <Pencil className="h-3.5 w-3.5" /> Edit
                                                            </Button>
                                                        }
                                                    />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Interview Experience</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this interview experience? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteExpMutation.mutate(post.id)}
                                                                    disabled={deleteExpMutation.isPending}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    {deleteExpMutation.isPending ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <>
                    {(discussions.length === 0) && (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No discussions yet</h3>
                            <p className="text-muted-foreground mt-1 mb-4">
                                You haven&apos;t started any community discussions.
                            </p>
                            <Link href="/posts/create">
                                <Button className="rounded-xl">Create a Post</Button>
                            </Link>
                        </div>
                    )}

                    <div className="space-y-4">
                        {discussions.map((discussion: Post, index: number) => (
                            <motion.div
                                key={discussion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:border-primary/50 transition-all rounded-xl border border-border/60 hover:shadow-sm group">
                                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                        <div>
                                            <Link href={`/posts/${discussion.id}`}>
                                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                                                    {discussion.title}
                                                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </CardTitle>
                                            </Link>
                                            <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(discussion.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 items-end justify-end max-w-[200px]">
                                            {discussion.tags?.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-xs line-clamp-2 text-muted-foreground leading-relaxed">
                                            {discussion.content}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                            <Link href={`/posts/${discussion.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary gap-1 px-2.5">
                                                    <Eye className="h-3.5 w-3.5" /> Open Thread
                                                </Button>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <EditPostModal
                                                    post={discussion}
                                                    trigger={
                                                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                                        </Button>
                                                    }
                                                />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Discussion Post</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this discussion post? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deletePostMutation.mutate(discussion.id)}
                                                                disabled={deletePostMutation.isPending}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Full experience preview modal */}
            {previewExp && (
                <Dialog open={!!previewExp} onOpenChange={(open) => !open && setPreviewExp(null)}>
                    <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">
                        <DialogHeader className="p-6 pr-14 pb-5 border-b bg-muted/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(previewExp.created_at).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <Badge variant="outline" className="text-sm px-3 py-1 shadow-sm">
                                    {previewExp.verdict}
                                </Badge>
                            </div>
                            <DialogTitle className="text-2xl font-extrabold text-left">
                                {previewExp.exam_name} ({previewExp.year})
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-4">
                                <Badge variant="outline">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    {previewExp.difficulty}
                                </Badge>
                            </div>
                        </DialogHeader>
                        <div className="overflow-y-auto p-6 md:p-8">
                            <MarkdownPreview value={previewExp.description} />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}