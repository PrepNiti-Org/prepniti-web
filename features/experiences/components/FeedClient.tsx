"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getExperiences } from "../api";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function FeedClient() {
    const [sortBy, setSortBy] = useState<"latest" | "top">("latest");
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["experiences-feed"],
        queryFn: ({ pageParam }) => getExperiences({ pageParam, sortBy }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    if (status === "pending") {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 w-full bg-muted/30 animate-pulse rounded-xl border" />
                ))}
            </div>
        );
    }

    if (status === "error") {
        return <div className="text-center text-red-500 py-10">Failed to load feed. Please try again.</div>;
    }

    const posts = data.pages.flatMap((page) => page.data);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {sortBy === "latest" ? "Latest" : "Top"} Experiences
                </h2>
                <div className="flex gap-4 text-sm font-medium">
                    <button 
                        onClick={() => setSortBy("latest")}
                        className={`transition-colors ${sortBy === "latest" ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Latest
                    </button>
                    <button 
                        onClick={() => setSortBy("top")}
                        className={`transition-colors ${sortBy === "top" ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Top
                    </button>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                    <p className="text-muted-foreground">No experiences shared yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index % 10) * 0.05 }}
                        >
                            <PostCard post={post} />
                        </motion.div>
                    ))}
                </div>
            )}

            {hasNextPage && (
                <div className="pt-4 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-full sm:w-auto"
                    >
                        {isFetchingNextPage ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...</>
                        ) : (
                            "Load More Experiences"
                        )}
                    </Button>
                </div>
            )}

            {!hasNextPage && posts.length > 0 && (
                <div className="text-center text-sm text-muted-foreground pt-8 pb-4">
                    You&apos;ve caught up on all experiences!
                </div>
            )}
        </div>
    );
}