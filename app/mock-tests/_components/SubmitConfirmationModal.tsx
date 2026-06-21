import React from "react";

interface SubmitConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    useRealisticTheme: boolean;
    counts: {
        notVisited: number;
        notAnswered: number;
        answered: number;
        markedReview: number;
        answeredMarkedReview: number;
        total: number;
    };
}

export function SubmitConfirmationModal({
    isOpen,
    onClose,
    onSubmit,
    useRealisticTheme,
    counts
}: SubmitConfirmationModalProps) {
    if (!isOpen) return null;

    const useRealistic = useRealisticTheme;

    // Get shape style for a given status (matching ExamWorkspace style)
    const getStatusStyle = (status: string) => {
        if (useRealistic) {
            let statusStyle = "bg-slate-200 dark:bg-slate-800 text-foreground border border-border rounded-sm";
            let clipPathStyle = undefined;

            if (status === "answered") {
                statusStyle = "bg-emerald-500 text-white";
                clipPathStyle = "polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%)";
            } else if (status === "not_answered") {
                statusStyle = "bg-red-500 text-white";
                clipPathStyle = "polygon(50% 0%, 100% 28%, 100% 100%, 0% 100%, 0% 28%)";
            } else if (status === "marked_review") {
                statusStyle = "bg-indigo-500 text-white rounded-full";
            } else if (status === "answered_marked_review") {
                statusStyle = "bg-indigo-500 text-white rounded-full relative after:content-[''] after:absolute after:bottom-[0.5px] after:right-[0.5px] after:h-2 after:w-2 after:bg-emerald-500 after:rounded-full after:border after:border-white";
            }
            return { className: statusStyle, clipPath: clipPathStyle };
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
            return { className: statusStyle, clipPath: undefined };
        }
    };

    const styleNotVisited = getStatusStyle("not_visited");
    const styleNotAnswered = getStatusStyle("not_answered");
    const styleAnswered = getStatusStyle("answered");
    const styleMarkedReview = getStatusStyle("marked_review");
    const styleAnsweredMarked = getStatusStyle("answered_marked_review");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200 animate-duration-200">
                {/* Modal Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                    <h3 className="text-base font-bold uppercase tracking-wider font-sans">
                        Exam Submission Confirmation
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex gap-3 text-sm text-yellow-800 dark:text-yellow-200 font-sans">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <span className="font-bold">Important Warning:</span> Once you submit, you will not be able to modify your answers or resume this mock test.
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">
                            Candidate Response Summary
                        </h4>
                        <div className="border border-border rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-slate-100 dark:bg-slate-900 text-muted-foreground font-semibold">
                                        <th className="px-4 py-3 font-sans">Question Status</th>
                                        <th className="px-4 py-3 text-right font-sans">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-sans text-foreground">
                                    <tr>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${styleNotVisited.className}`} style={styleNotVisited.clipPath ? { clipPath: styleNotVisited.clipPath } : undefined}></span>
                                            <span>Not Visited</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-base">
                                            {counts.notVisited}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${styleNotAnswered.className}`} style={styleNotAnswered.clipPath ? { clipPath: styleNotAnswered.clipPath } : undefined}></span>
                                            <span>Not Answered</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-base text-red-500">
                                            {counts.notAnswered}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${styleAnswered.className}`} style={styleAnswered.clipPath ? { clipPath: styleAnswered.clipPath } : undefined}></span>
                                            <span>Answered</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-base text-emerald-500">
                                            {counts.answered}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${styleMarkedReview.className}`} style={styleMarkedReview.clipPath ? { clipPath: styleMarkedReview.clipPath } : undefined}></span>
                                            <span>Marked for Review</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-base text-indigo-500">
                                            {counts.markedReview}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${styleAnsweredMarked.className}`} style={styleAnsweredMarked.clipPath ? { clipPath: styleAnsweredMarked.clipPath } : undefined}></span>
                                            <span>Answered & Marked for Review (will be considered for evaluation)</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-base text-indigo-500">
                                            {counts.answeredMarkedReview}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-100/50 dark:bg-slate-900/50 font-bold border-t border-border/80">
                                        <td className="px-4 py-3">Total Questions</td>
                                        <td className="px-4 py-3 text-right font-mono text-base">
                                            {counts.total}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-center text-sm font-semibold text-muted-foreground pt-2">
                        Are you sure you want to submit the exam now?
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 dark:bg-slate-950/20 px-6 py-4 flex items-center justify-end gap-3 border-t border-border shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors select-none font-sans"
                    >
                        No, Return to Test
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-6 py-2.5 text-xs font-bold bg-[#44a037] hover:bg-[#3c8e31] text-white border border-transparent rounded transition-colors select-none font-sans shadow-md"
                    >
                        Yes, Submit Exam
                    </button>
                </div>
            </div>
        </div>
    );
}
