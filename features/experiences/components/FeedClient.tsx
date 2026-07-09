"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getExperiences } from "../api";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    TrendingUp,
    Clock,
    Star,
    Search,
    X,
    SlidersHorizontal,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const EXAM_OPTIONS = [
    "UPSC CSE",
    "UPSC CAPF",
    "SSC CGL",
    "SSC CHSL",
    "IBPS PO",
    "IBPS Clerk",
    "SBI PO",
    "RBI Grade B",
    "State PSC",
    "NDA",
    "CDS",
];

const VERDICT_OPTIONS = ["Selected", "Rejected", "Waitlist"] as const;
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

const SORT_OPTIONS = [
    { value: "feed", label: "Trending", icon: TrendingUp },
    { value: "newest", label: "Latest", icon: Clock },
    { value: "popular", label: "Top (30 days)", icon: Star },
] as const;

export function FeedClient() {
    const [sort, setSort] = useState<"feed" | "newest" | "popular">("feed");
    const [examName, setExamName] = useState("");
    const [verdict, setVerdict] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [searchVal, setSearchVal] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchVal), 400);
        return () => clearTimeout(t);
    }, [searchVal]);

    const clearFilters = useCallback(() => {
        setExamName("");
        setVerdict("");
        setDifficulty("");
        setSearchVal("");
        setDebouncedSearch("");
    }, []);

    const activeFilterCount = [examName, verdict, difficulty, debouncedSearch].filter(Boolean).length;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["experiences-feed", sort, examName, verdict, difficulty, debouncedSearch],
        queryFn: ({ pageParam }) =>
            getExperiences({
                pageParam,
                sort,
                examName: examName || undefined,
                verdict: verdict || undefined,
                difficulty: difficulty || undefined,
                search: debouncedSearch || undefined,
            }),
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
        return <div className="text-center text-destructive py-10 text-sm">Failed to load feed. Please try again.</div>;
    }

    const experiences = data.pages.flatMap((page) => page.data);
    const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];
    const SortIcon = currentSort.icon;

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold flex items-center gap-2 shrink-0">
                    <SortIcon className="h-4 w-4 text-primary" />
                    {currentSort.label} Experiences
                </h2>

                <div className="flex items-center gap-2">
                    {/* Sort toggle pills */}
                    <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
                        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setSort(value)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    sort === value
                                        ? "bg-card shadow-sm text-foreground border border-border/60"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="h-3 w-3" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Mobile sort select */}
                    <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                        <SelectTrigger className="sm:hidden h-8 text-xs w-[110px] rounded-xl border-border/60 cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map(({ value, label }) => (
                                <SelectItem key={value} value={value} className="cursor-pointer text-xs">{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter toggle button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFiltersOpen((o) => !o)}
                        className="h-8 gap-1.5 text-xs rounded-xl border-border/60 cursor-pointer"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge className="ml-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full">
                                {activeFilterCount}
                            </Badge>
                        )}
                        <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* Expandable filters panel */}
            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search experiences..."
                                    value={searchVal}
                                    onChange={(e) => setSearchVal(e.target.value)}
                                    className="pl-9 h-8 text-xs rounded-xl bg-card border-border/60"
                                />
                                {searchVal && (
                                    <button
                                        onClick={() => { setSearchVal(""); setDebouncedSearch(""); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Exam / Verdict / Difficulty selects */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Select value={examName || "all"} onValueChange={(v) => setExamName(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-8 text-xs rounded-xl border-border/60 cursor-pointer">
                                        <SelectValue placeholder="Exam" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer text-xs">All Exams</SelectItem>
                                        {EXAM_OPTIONS.map((e) => (
                                            <SelectItem key={e} value={e} className="cursor-pointer text-xs">{e}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={verdict || "all"} onValueChange={(v) => setVerdict(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-8 text-xs rounded-xl border-border/60 cursor-pointer">
                                        <SelectValue placeholder="Verdict" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer text-xs">All Verdicts</SelectItem>
                                        {VERDICT_OPTIONS.map((v) => (
                                            <SelectItem key={v} value={v} className="cursor-pointer text-xs">{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={difficulty || "all"} onValueChange={(v) => setDifficulty(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-8 text-xs rounded-xl border-border/60 cursor-pointer">
                                        <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer text-xs">All Difficulties</SelectItem>
                                        {DIFFICULTY_OPTIONS.map((d) => (
                                            <SelectItem key={d} value={d} className="cursor-pointer text-xs">{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Active filter badges + clear */}
                            {activeFilterCount > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {examName && (
                                        <Badge variant="secondary" className="text-[10px] h-5 gap-1 cursor-pointer" onClick={() => setExamName("")}>
                                            {examName} <X className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                    {verdict && (
                                        <Badge variant="secondary" className="text-[10px] h-5 gap-1 cursor-pointer" onClick={() => setVerdict("")}>
                                            {verdict} <X className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                    {difficulty && (
                                        <Badge variant="secondary" className="text-[10px] h-5 gap-1 cursor-pointer" onClick={() => setDifficulty("")}>
                                            {difficulty} <X className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                    {debouncedSearch && (
                                        <Badge variant="secondary" className="text-[10px] h-5 gap-1 cursor-pointer" onClick={() => { setSearchVal(""); setDebouncedSearch(""); }}>
                                            &ldquo;{debouncedSearch}&rdquo; <X className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                    <button
                                        onClick={clearFilters}
                                        className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer ml-auto"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feed */}
            {experiences.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                    <p className="text-muted-foreground text-sm">No experiences match your filters.</p>
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-primary mt-2 underline underline-offset-2 cursor-pointer">
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index % 10) * 0.04 }}
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
                        className="w-full sm:w-auto rounded-xl cursor-pointer"
                    >
                        {isFetchingNextPage ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...</>
                        ) : (
                            "Load More Experiences"
                        )}
                    </Button>
                </div>
            )}

            {!hasNextPage && experiences.length > 0 && (
                <div className="text-center text-xs text-muted-foreground pt-8 pb-4">
                    You&apos;ve seen all experiences
                </div>
            )}
        </div>
    );
}