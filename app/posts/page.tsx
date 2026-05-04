"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts, Post } from "@/features/posts/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PostsPage() {
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

    return (
        <div className="container max-w-4xl py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Discussions</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Engage with the community, share strategies, and ask questions.
                    </p>
                </div>
                <Link href="/posts/create">
                    <Button size="lg" className="rounded-full shadow-md">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Post
                    </Button>
                </Link>
            </div>

            {status === "pending" ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
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
                                    <Link href={`/posts/${post.id}`}>
                                        <Card className="hover:shadow-lg transition-all duration-300 border-muted/50 cursor-pointer overflow-hidden group">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                            {post.title}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1.5 flex items-center space-x-2 text-sm">
                                                            <span className="font-medium text-foreground">
                                                                @{post.user?.username || "anonymous"}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {post.content}
                                                </p>
                                                
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {post.tags.map(tag => (
                                                            <Badge key={tag} variant="secondary" className="px-2.5 py-0.5 rounded-full font-normal">
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="bg-muted/30 pt-4 pb-4 border-t border-muted/30">
                                                <div className="flex items-center space-x-6 text-muted-foreground text-sm font-medium">
                                                    <div className="flex items-center space-x-1.5 hover:text-primary transition-colors">
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <span>{post.upvotes}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5 hover:text-primary transition-colors">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span>Discuss</span>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
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
                </div>
            )}

            {hasNextPage && (
                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? "Loading more..." : "Load More Discussions"}
                    </Button>
                </div>
            )}
        </div>
    );
}
