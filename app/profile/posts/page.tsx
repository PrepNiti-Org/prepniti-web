"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserExperiences } from "@/features/profile/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyPostsPage() {
    const { data: posts, isLoading } = useQuery({
        queryKey: ["my-experiences"],
        queryFn: getUserExperiences,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center gap-4 mb-8">
                <Link href="/profile">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Contributions</h1>
                    <p className="text-muted-foreground mt-1">
                        All the interview experiences you&apos;ve shared with the PrepNiti community.
                    </p>
                </div>
            </div>

            {(!posts || posts.length === 0) && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No posts yet</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                        You haven&apos;t shared any interview experiences.
                    </p>
                    <Link href="/submit">
                        <Button>Share an Experience</Button>
                    </Link>
                </div>
            )}

            <div className="space-y-4">
                {posts?.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="hover:border-primary/50 transition-colors">
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
                            <CardContent>
                                <p className="text-sm line-clamp-3 text-muted-foreground">
                                    {post.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}