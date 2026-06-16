"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, BookOpen, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  user: {
    username: string;
  };
}

interface Experience {
  id: string;
  exam_name: string;
  year: number;
  verdict: string;
  difficulty: string;
  description: string;
  user?: {
    username: string;
  };
}

interface SearchResults {
  posts: Post[];
  experiences: Experience[];
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "experiences">("all");

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="p-4 bg-muted w-fit rounded-full mx-auto">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Search PrepNiti</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Type your keywords in the top search bar to locate strategy discussions or candidate reviews.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-destructive font-semibold">
        Failed to fetch search results. Please check your connection.
      </div>
    );
  }

  const posts = data?.posts || [];
  const experiences = data?.experiences || [];
  const totalResults = posts.length + experiences.length;

  const filteredPosts = activeTab === "experiences" ? [] : posts;
  const filteredExperiences = activeTab === "posts" ? [] : experiences;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/40">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Search Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Found {totalResults} match{totalResults !== 1 && "es"} across the platform.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          All ({totalResults})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Discussions ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("experiences")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${activeTab === "experiences"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Experiences ({experiences.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {totalResults === 0 && (
            <Card className="p-8 text-center border-dashed bg-muted/10">
              <p className="text-muted-foreground">No matches found. Try using simpler terms.</p>
            </Card>
          )}

          {filteredPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
                Discussions
              </h2>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border border-border/80 bg-card/45 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {post.user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground font-semibold">
                          @{post.user.username}
                        </span>
                      </div>
                      <Link href={`/posts/${post.id}`}>
                        <CardTitle className="text-lg font-bold hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredExperiences.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
                Interview Experiences
              </h2>
              {filteredExperiences.map((exp) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border border-border/80 bg-card/45 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {exp.exam_name} ({exp.year})
                          </Badge>
                          <Link href={`/experiences/${exp.id}`}>
                            <CardTitle className="text-lg font-bold pt-1 hover:text-primary transition-colors">
                              {exp.exam_name} Review
                            </CardTitle>
                          </Link>
                        </div>
                        <Badge
                          variant={exp.verdict === "Selected" ? "default" : "secondary"}
                          className="font-bold text-xs"
                        >
                          {exp.verdict}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {exp.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 h-fit">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5 font-bold">
                <Sparkles className="h-4 w-4 text-primary" />
                Refine Search
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>• Use tags like <strong>#upsc</strong> or <strong>#history</strong> for topic filtering.</p>
              <p>• Lookup specific exam years (e.g. <strong>2024</strong>) to view relevant interviews.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        }
      >
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
