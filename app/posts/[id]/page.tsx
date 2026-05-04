"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, deletePost } from "@/features/posts/api";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Trash2, Edit, Calendar, User, ThumbsUp, Tag } from "lucide-react";
import Link from "next/link";
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
import { motion } from "framer-motion";

export default function SinglePostPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isHydrated } = useAuth();
    
    const id = params.id as string;

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ["post", id],
        queryFn: () => getPostById(id),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post deleted successfully");
            router.push("/posts");
        },
        onError: () => {
            toast.error("Failed to delete post");
        },
    });

    if (isLoading) {
        return (
            <div className="container max-w-4xl py-10 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="container max-w-4xl py-20 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-4">Post not found</h2>
                <Button onClick={() => router.push("/posts")}>Back to Discussions</Button>
            </div>
        );
    }

    const isAuthor = isHydrated && user?.username === post.user?.username;

    return (
        <div className="container max-w-4xl py-10">
            <Link href="/posts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Discussions
            </Link>

            <motion.article 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4 }}
                className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
            >
                <div className="p-8 md:p-10 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="px-3 py-1 rounded-full text-xs font-medium border-primary/20 text-primary">
                                            <Tag className="mr-1 h-3 w-3" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                                {post.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1.5 font-medium text-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{post.user?.username || "Anonymous"}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center space-x-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(post.created_at), "MMMM d, yyyy")}</span>
                                </div>
                                <span>•</span>
                                <span className="italic">{formatDistanceToNow(new Date(post.created_at))} ago</span>
                            </div>
                        </div>

                        {isAuthor && (
                            <div className="flex items-center gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="flex items-center">
                                            <Trash2 className="h-4 w-4 mr-1.5" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                post and remove the data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => deleteMutation.mutate(id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {deleteMutation.isPending ? "Deleting..." : "Yes, delete post"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 md:p-10 bg-background/50">
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>

                <div className="p-6 bg-muted/20 border-t border-border/50 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Helpful ({post.upvotes})
                    </Button>
                </div>
            </motion.article>
        </div>
    );
}
