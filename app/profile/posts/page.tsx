"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserExperiences } from "@/features/profile/api";
import { getPosts } from "@/features/posts/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, FileText, MessageSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyPostsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"experiences" | "discussions">("experiences");

    const { data: experiences, isLoading: isExperiencesLoading } = useQuery({
        queryKey: ["my-experiences"],
        queryFn: getUserExperiences,
    });

    const { data: discussionsData, isLoading: isDiscussionsLoading } = useQuery({
        queryKey: ["my-discussions", user?.id],
        queryFn: () => getPosts({ userId: String(user?.id) }),
        enabled: !!user?.id,
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
                        Review all the posts and interview reviews you&apos;ve shared with the community.
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
                        {experiences?.map((post, index) => (
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
                                    <CardContent>
                                        <p className="text-sm line-clamp-3 text-muted-foreground leading-relaxed">
                                            {post.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
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
                        {discussions.map((discussion, index) => (
                            <motion.div
                                key={discussion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/posts/${discussion.id}`}>
                                    <Card className="hover:border-primary/50 transition-all cursor-pointer rounded-xl border border-border/60 hover:shadow-sm group">
                                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                                                    {discussion.title}
                                                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </CardTitle>
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
                                        <CardContent>
                                            <p className="text-xs line-clamp-2 text-muted-foreground leading-relaxed">
                                                {discussion.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}