import React, { useState } from "react";
import { Paper } from "./types";
import { getExamName } from "./utils";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExamInstructionsProps {
    selectedPaper: Paper | undefined;
    selectedPaperDuration: number;
    onStartExam: () => void;
    onCancel: () => void;
    defaultLanguage: string;
    setDefaultLanguage: (lang: string) => void;
    useRealisticTheme: boolean;
    setUseRealisticTheme: (val: boolean) => void;
}

export function ExamInstructions({
    selectedPaper,
    selectedPaperDuration,
    onStartExam,
    onCancel,
    defaultLanguage,
    setDefaultLanguage,
    useRealisticTheme,
    setUseRealisticTheme
}: ExamInstructionsProps) {
    const [instructionStep, setInstructionStep] = useState<1 | 2>(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const notVisitedClass = useRealisticTheme 
        ? "h-7 w-8 rounded-sm flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-foreground font-bold text-xs border border-border shrink-0 font-mono"
        : "h-7 w-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-muted-foreground font-bold text-xs border border-border/80 shrink-0 font-mono";

    const notAnsweredClass = useRealisticTheme
        ? "h-7 w-8 pt-0.5 flex items-center justify-center bg-red-500 text-white font-bold text-xs shrink-0 font-mono"
        : "h-7 w-7 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-bold text-xs border border-rose-500/30 shrink-0 font-mono";

    const answeredClass = useRealisticTheme
        ? "h-7 w-8 pb-0.5 flex items-center justify-center bg-emerald-500 text-white font-bold text-xs shrink-0 font-mono"
        : "h-7 w-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 shrink-0 font-mono";

    const markedReviewClass = useRealisticTheme
        ? "h-7 w-8 rounded-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs shrink-0 font-mono"
        : "h-7 w-7 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 font-bold text-xs border border-violet-500/30 shrink-0 font-mono";

    const answeredMarkedReviewClass = useRealisticTheme
        ? "h-7 w-8 rounded-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs relative after:content-[''] after:absolute after:bottom-[1.5px] after:right-[1.5px] after:h-2.5 after:w-2.5 after:bg-emerald-500 after:rounded-full after:border after:border-white shrink-0 font-mono"
        : "h-7 w-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold text-xs border border-indigo-500/30 shrink-0 font-mono relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-2 after:w-2 after:bg-emerald-500 after:rounded-full";

    const examName = getExamName(selectedPaper);
    const headerTitle = examName === "Online" ? "Online Examination System" : `${examName} Examination System`;

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col select-none">
            {/* Instructions Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg tracking-wide uppercase font-sans">{headerTitle}</span>
                </div>
                <div className="text-sm text-slate-300 font-medium bg-slate-950 px-3 py-1 rounded border border-slate-800">
                    System Name: <span className="text-emerald-400 font-mono font-bold font-sans">LAB-TERMINAL-01</span>
                </div>
            </div>

            {/* Instructions Body */}
            <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 overflow-y-auto lg:overflow-hidden bg-slate-50 dark:bg-slate-950/20">
                {/* Left Pane (Scrollable instructions details) */}
                <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border bg-card overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
                        <h2 className="font-bold text-sm text-foreground uppercase tracking-wider font-sans">
                            {instructionStep === 1 ? "General Instructions" : "Other Important Instructions & Candidate Declaration"}
                        </h2>
                        <div className="text-xs text-muted-foreground font-semibold">
                            Step {instructionStep} of 2
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
                        {instructionStep === 1 ? (
                            <>
                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-foreground text-base">General Guidelines:</h3>
                                    <ol className="list-decimal pl-5 space-y-2.5">
                                        <li>Total duration of the examination is <span className="font-bold text-foreground">{selectedPaperDuration} minutes</span>.</li>
                                        <li>The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
                                        <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</li>
                                    </ol>
                                </div>

                                <div className="border border-border rounded-xl p-4 bg-slate-100/50 dark:bg-slate-900/40 space-y-4">
                                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Question Status Legend:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <span className={notVisitedClass}>1</span>
                                            <div>
                                                <span className="font-bold text-foreground block text-xs">Not Visited</span>
                                                <span className="text-xs text-muted-foreground">You have not visited the question yet.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span 
                                                className={notAnsweredClass}
                                                style={useRealisticTheme ? { clipPath: "polygon(50% 0%, 100% 28%, 100% 100%, 0% 100%, 0% 28%)" } : undefined}
                                            >
                                                2
                                            </span>
                                            <div>
                                                <span className="font-bold text-foreground block text-xs">Not Answered</span>
                                                <span className="text-xs text-muted-foreground">You have visited the question but have not answered it.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span 
                                                className={answeredClass}
                                                style={useRealisticTheme ? { clipPath: "polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%)" } : undefined}
                                            >
                                                3
                                            </span>
                                            <div>
                                                <span className="font-bold text-foreground block text-xs">Answered</span>
                                                <span className="text-xs text-muted-foreground">You have answered the question.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className={markedReviewClass}>4</span>
                                            <div>
                                                <span className="font-bold text-foreground block text-xs">Marked for Review</span>
                                                <span className="text-xs text-muted-foreground">You have not answered the question, but have marked it for review.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                                            <span className={answeredMarkedReviewClass}>5</span>
                                            <div>
                                                <span className="font-bold text-foreground block text-xs">Answered & Marked for Review</span>
                                                <span className="text-xs text-muted-foreground">The question(s) answered and marked for review will be considered for evaluation.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-foreground text-base">Navigating to a Question:</h3>
                                    <p>To answer a question, perform the following steps:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                                        <li>Click on <span className="font-bold text-foreground">Save & Next</span> to save your answer for the current question and then go to the next question.</li>
                                        <li>Click on <span className="font-bold text-foreground">Mark for Review & Next</span> to save your answer for the current question, mark it for review, and then go to the next question.</li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h3 className="font-extrabold text-foreground text-base">Other Important Instructions:</h3>
                                    <p>
                                        1. This simulated environment enforces standard CBT rules. All keyboard functions (except text inputs if any) are monitored.
                                        You should not attempt to refresh the browser window or use shortcuts.
                                    </p>
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 space-y-2">
                                        <span className="font-bold block text-sm">Security Lockdown Warning:</span>
                                        <p className="text-xs leading-relaxed">
                                            By entering the examination workspace, your browser will request full-screen display.
                                            You are strictly prohibited from exiting full-screen mode, switching browser tabs, minimizing the browser window, or losing window focus. 
                                            Doing any of these actions will trigger an **immediate, automatic submission** of your exam, and you will not be allowed to resume the test.
                                        </p>
                                    </div>
                                </div>

                                 <div className="space-y-3">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block font-sans">Choose your default language:</label>
                                    <Select 
                                        value={defaultLanguage} 
                                        onValueChange={setDefaultLanguage}
                                    >
                                        <SelectTrigger className="w-full max-w-xs h-10 rounded-xl bg-background border border-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Hindi">Hindi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">Please note that all questions will be displayed in this language by default, but you can change the view language during the exam.</p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border/60">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block font-sans">Workspace Theme Preference:</label>
                                    <div 
                                        onClick={() => setUseRealisticTheme(!useRealisticTheme)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                                            useRealisticTheme 
                                                ? "bg-slate-100/60 dark:bg-slate-900/45 border-slate-300 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900/60" 
                                                : "bg-primary/5 dark:bg-primary/10 border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/15"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            id="realistic-theme-checkbox"
                                            checked={useRealisticTheme}
                                            onChange={() => {}} // Controlled by the card wrapper onClick
                                            className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary shrink-0 cursor-pointer"
                                        />
                                        <div className="space-y-1">
                                            <span className="font-bold text-foreground block text-sm font-sans">
                                                Enable Realistic Exam Theme (Recommended)
                                            </span>
                                            <span className="text-xs text-muted-foreground block leading-relaxed font-sans">
                                                Simulates the exact look, sharp frames, flat buttons, and pentagon indicators of official test portals (TCS iON / NTA). Uncheck to use PrepNiti's modern layout.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex items-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="declaration-checkbox" 
                                        checked={agreedToTerms} 
                                        onChange={(e) => {
                                            setAgreedToTerms(e.target.checked);
                                        }}
                                        className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary shrink-0 cursor-pointer"
                                    />
                                    <label htmlFor="declaration-checkbox" className="text-xs font-semibold text-foreground cursor-pointer select-none leading-relaxed">
                                        I have read and understood the instructions. All computer hardware systems allotted to me are in proper working condition. I agree to comply with the rules and the code of conduct of the examination. I understand that any violation of browser boundaries (fullscreen exit, tab switch, focus loss) will be treated as a security violation and will result in immediate, automatic submission of my test paper.
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
                        {instructionStep === 1 ? (
                            <>
                                <Button variant="outline" onClick={onCancel}>
                                    Cancel & Return
                                </Button>
                                <Button onClick={() => setInstructionStep(2)} className="font-semibold gap-2">
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setInstructionStep(1)}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                                <Button 
                                    onClick={onStartExam} 
                                    disabled={!agreedToTerms}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6"
                                >
                                    I AM READY TO BEGIN
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Pane (Candidate Card) */}
                <div className="lg:col-span-1 bg-card flex flex-col justify-between p-6">
                    <div className="space-y-6">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pb-2 border-b border-border font-sans">Candidate Profile</h3>
                        
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-32 w-32 rounded-lg border-2 border-primary bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-muted-foreground overflow-hidden shadow-inner">
                                <span className="text-4xl font-black text-slate-400 dark:text-slate-600">PN</span>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Photo Preview</span>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-extrabold text-base text-foreground leading-snug font-sans">Aspirant Candidate</h4>
                                <p className="text-xs text-muted-foreground font-mono">Roll No: PN-2026-MOCK</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border text-xs leading-relaxed">
                            <div>
                                <span className="text-muted-foreground block font-medium">Subject/Paper Name:</span>
                                <span className="font-bold text-foreground break-all">{selectedPaper?.filename.replace(/\.[^/.]+$/, "")}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block font-medium">Allocated Duration:</span>
                                <span className="font-bold text-foreground">{selectedPaperDuration} Minutes</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block font-medium">System IP Address:</span>
                                <span className="font-mono text-foreground">127.0.0.1 (Local Client)</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-muted-foreground pt-4 border-t border-border font-medium font-mono">
                        PrepNiti CBT Engine v1.2
                    </div>
                </div>
            </div>
        </div>
    );
}
