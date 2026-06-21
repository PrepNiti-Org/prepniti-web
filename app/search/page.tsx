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
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
            <Search className="h-9 w-9 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Search PrepNiti</h2>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          Find strategy discussions, exam experiences, or specific topics. Use the search bar at the top to get started.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["UPSC Interview", "SBI PO Experience", "Study strategy", "GATE 2024"].map(hint => (
            <Badge key={hint} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
              {hint}
            </Badge>
          ))}
        </div>
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
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-dot-pattern opacity-15 pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary/80">Search Results</p>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              &ldquo;{query}&rdquo;
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Found <span className="font-bold text-foreground">{totalResults}</span> match{totalResults !== 1 && "es"} across discussions and experiences.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm font-black px-3 py-1.5 shrink-0">
            {totalResults}
          </Badge>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border pb-px">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("all")}
          className={`rounded-none border-b-2 -mb-px text-sm font-semibold transition-all h-9 ${activeTab === "all"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          All ({totalResults})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("posts")}
          className={`rounded-none border-b-2 -mb-px text-sm font-semibold transition-all h-9 ${activeTab === "posts"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Discussions ({posts.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("experiences")}
          className={`rounded-none border-b-2 -mb-px text-sm font-semibold transition-all h-9 ${activeTab === "experiences"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Experiences ({experiences.length})
        </Button>
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
