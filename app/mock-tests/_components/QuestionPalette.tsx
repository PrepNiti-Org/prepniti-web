import React, { useMemo } from "react";

interface QuestionPaletteProps {
    questionsCount: number;
    currentQuestionIndex: number;
    onJumpToQuestion: (index: number) => void;
    questionStatuses: Record<string, string>;
    questionIds: string[];
    useRealisticTheme: boolean;
    counts: {
        notVisited: number;
        notAnswered: number;
        answered: number;
        markedReview: number;
        answeredMarkedReview: number;
    };
    activeSection?: string;
    questionTopics?: string[];
}

export function QuestionPalette({
    questionsCount,
    currentQuestionIndex,
    onJumpToQuestion,
    questionStatuses,
    questionIds,
    useRealisticTheme,
    counts,
    activeSection,
    questionTopics
}: QuestionPaletteProps) {
    const useRealistic = useRealisticTheme;

    const getStatusStyle = (status: string) => {
        if (useRealistic) {
            let statusStyle = "bg-slate-200 dark:bg-slate-800 text-foreground border border-border rounded-sm";
            let clipPathStyle = undefined;
            let alignClass = "";

            if (status === "answered") {
                statusStyle = "bg-emerald-500 text-white";
                clipPathStyle = "polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%)";
                alignClass = "pb-0.5";
            } else if (status === "not_answered") {
                statusStyle = "bg-red-500 text-white";
                clipPathStyle = "polygon(50% 0%, 100% 28%, 100% 100%, 0% 100%, 0% 28%)";
                alignClass = "pt-0.5";
            } else if (status === "marked_review") {
                statusStyle = "bg-indigo-500 text-white rounded-full";
            } else if (status === "answered_marked_review") {
                statusStyle = "bg-indigo-500 text-white rounded-full relative after:content-[''] after:absolute after:bottom-[1.5px] after:right-[1.5px] after:h-2.5 after:w-2.5 after:bg-emerald-500 after:rounded-full after:border after:border-white";
            }
            return { className: statusStyle, clipPath: clipPathStyle, alignClass };
        } else {
            let statusStyle = "bg-slate-100 dark:bg-slate-800/80 text-muted-foreground border border-border/80 rounded-xl";
            if (status === "answered") {
                statusStyle = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 rounded-xl";
            } else if (status === "not_answered") {
                statusStyle = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30 rounded-xl";
            } else if (status === "marked_review") {
                statusStyle = "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/30 rounded-xl";
            } else if (status === "answered_marked_review") {
                statusStyle = "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/30 rounded-xl relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-2 after:w-2 after:bg-emerald-500 after:rounded-full";
            }
            return { className: statusStyle, clipPath: undefined, alignClass: "" };
        }
    };

    const paletteHeaderClass = useRealistic
        ? "bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 rounded border border-border uppercase tracking-wider mb-3 font-sans shrink-0"
        : "px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans shrink-0";

    const paletteBoxClass = useRealistic
        ? "border border-border/60 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-1.5 flex-1 overflow-hidden flex flex-col"
        : "border border-border rounded-2xl bg-muted/20 p-2 flex-1 overflow-hidden flex flex-col";

    const sidebarLegendClass = useRealistic
        ? "grid grid-cols-2 gap-3 text-xs mb-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/60 shrink-0"
        : "grid grid-cols-2 gap-3 text-xs mb-5 bg-muted/30 p-4 rounded-2xl border border-border/50 shrink-0";

    const legendLabelClass = useRealistic
        ? "text-slate-700 dark:text-slate-300 font-semibold text-[11px] font-sans"
        : "text-muted-foreground font-sans";

    const shapeSizeClass = useRealistic ? "h-7 w-8" : "h-7 w-7";

    const getCountFontClass = (count: number) => {
        if (count >= 100) return "text-[9px]";
        if (count >= 10) return "text-[10px]";
        return "text-xs";
    };

    const filteredIndices = useMemo(() => {
        if (!activeSection || !questionTopics) {
            return Array.from({ length: questionsCount }, (_, i) => i);
        }
        return Array.from({ length: questionsCount }, (_, i) => i).filter(
            i => (questionTopics[i] || "Questions") === activeSection
        );
    }, [questionsCount, activeSection, questionTopics]);

    const activeCounts = useMemo(() => {
        if (!activeSection || !questionTopics) return counts;
        const c = {
            notVisited: 0,
            notAnswered: 0,
            answered: 0,
            markedReview: 0,
            answeredMarkedReview: 0
        };
        filteredIndices.forEach(idx => {
            const qId = questionIds[idx];
            const status = questionStatuses[qId] || "not_visited";
            if (status === "not_visited") c.notVisited++;
            else if (status === "not_answered") c.notAnswered++;
            else if (status === "answered") c.answered++;
            else if (status === "marked_review") c.markedReview++;
            else if (status === "answered_marked_review") c.answeredMarkedReview++;
        });
        return c;
    }, [filteredIndices, questionIds, questionStatuses, counts, activeSection, questionTopics]);

    const styleNotVisited = getStatusStyle("not_visited");
    const styleNotAnswered = getStatusStyle("not_answered");
    const styleAnswered = getStatusStyle("answered");
    const styleMarkedReview = getStatusStyle("marked_review");
    const styleAnsweredMarked = getStatusStyle("answered_marked_review");

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className={sidebarLegendClass}>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center font-bold font-mono shrink-0 ${shapeSizeClass} ${styleNotVisited.className} ${styleNotVisited.alignClass} ${getCountFontClass(activeCounts.notVisited)}`} style={styleNotVisited.clipPath ? { clipPath: styleNotVisited.clipPath } : undefined}>
                        {activeCounts.notVisited}
                    </span>
                    <span className={legendLabelClass}>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center font-bold font-mono shrink-0 ${shapeSizeClass} ${styleNotAnswered.className} ${styleNotAnswered.alignClass} ${getCountFontClass(activeCounts.notAnswered)}`} style={styleNotAnswered.clipPath ? { clipPath: styleNotAnswered.clipPath } : undefined}>
                        {activeCounts.notAnswered}
                    </span>
                    <span className={legendLabelClass}>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center font-bold font-mono shrink-0 ${shapeSizeClass} ${styleAnswered.className} ${styleAnswered.alignClass} ${getCountFontClass(activeCounts.answered)}`} style={styleAnswered.clipPath ? { clipPath: styleAnswered.clipPath } : undefined}>
                        {activeCounts.answered}
                    </span>
                    <span className={legendLabelClass}>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center font-bold font-mono shrink-0 ${shapeSizeClass} ${styleMarkedReview.className} ${styleMarkedReview.alignClass} ${getCountFontClass(activeCounts.markedReview)}`} style={styleMarkedReview.clipPath ? { clipPath: styleMarkedReview.clipPath } : undefined}>
                        {activeCounts.markedReview}
                    </span>
                    <span className={legendLabelClass}>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 mt-1">
                    <span className={`flex items-center justify-center font-bold font-mono shrink-0 ${shapeSizeClass} ${styleAnsweredMarked.className} ${styleAnsweredMarked.alignClass} ${getCountFontClass(activeCounts.answeredMarkedReview)}`} style={styleAnsweredMarked.clipPath ? { clipPath: styleAnsweredMarked.clipPath } : undefined}>
                        {activeCounts.answeredMarkedReview}
                    </span>
                    <span className={legendLabelClass}>Answered & Marked for Review</span>
                </div>
            </div>

            <div className={paletteHeaderClass}>
                Question Palette
            </div>

            <div className={paletteBoxClass}>
                <div className="overflow-y-auto pr-1 flex-1">
                    <div className="grid grid-cols-5 gap-2 p-2">
                        {filteredIndices.map((idx) => {
                            const qId = questionIds[idx];
                            const status = questionStatuses[qId] || "not_visited";
                            const isActive = idx === currentQuestionIndex;
                            const { className: statusStyle, clipPath: clipPathStyle, alignClass } = getStatusStyle(status);

                            const focusRingStyle = isActive
                                ? (useRealistic ? "ring-2 ring-slate-800 dark:ring-slate-200 ring-offset-1 rounded-sm" : "ring-2 ring-primary ring-offset-1 rounded-xl scale-105 z-10")
                                : "hover:opacity-90 hover:scale-102";

                            return (
                                <div
                                    key={qId || idx}
                                    className={`transition-all duration-200 ${focusRingStyle}`}
                                >
                                    <button
                                        onClick={() => onJumpToQuestion(idx)}
                                        className={`aspect-square w-full flex items-center justify-center font-bold transition-all duration-155 ${statusStyle} ${alignClass} ${getCountFontClass(idx + 1)}`}
                                        style={clipPathStyle ? { clipPath: clipPathStyle } : undefined}
                                    >
                                        {idx + 1}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
