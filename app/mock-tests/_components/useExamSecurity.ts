import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Cross-browser check if the Fullscreen API is supported on the client
 */
export function isFullscreenSupported(): boolean {
    if (typeof document === "undefined") return false;
    const doc = document as any;
    return !!(
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled
    );
}

/**
 * Cross-browser helper to get the currently active fullscreen element
 */
export function getFullscreenElement(): Element | null {
    if (typeof document === "undefined") return null;
    const doc = document as any;
    return (
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        null
    );
}

/**
 * Cross-browser check if the document is currently in fullscreen
 */
export function isDocumentFullscreen(): boolean {
    return !!getFullscreenElement();
}

export function useExamSecurity(step: string, onSubmitRef: React.MutableRefObject<(reason?: string) => void>) {
    const isExitingIntentionally = useRef(false);
    const violationTriggered = useRef(false);
    const isGracePeriod = useRef(false);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const enterFullscreen = async (): Promise<boolean> => {
        if (typeof document === "undefined") return false;
        const docEl = document.documentElement as any;
        try {
            if (docEl.requestFullscreen) {
                await docEl.requestFullscreen();
            } else if (docEl.webkitRequestFullscreen) {
                await docEl.webkitRequestFullscreen();
            } else if (docEl.mozRequestFullScreen) {
                await docEl.mozRequestFullScreen();
            } else if (docEl.msRequestFullscreen) {
                await docEl.msRequestFullscreen();
            } else {
                return false;
            }
            return true;
        } catch (err) {
            console.warn("Fullscreen request rejected or not supported:", err);
            return false;
        }
    };

    const exitFullscreen = async () => {
        if (typeof document === "undefined") return;
        isExitingIntentionally.current = true;
        const doc = document as any;
        try {
            if (isDocumentFullscreen()) {
                if (doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    await doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    await doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    await doc.msExitFullscreen();
                }
            }
        } catch (err) {
            console.warn("Error exiting fullscreen:", err);
        }
    };

    useEffect(() => {
        if (step !== "testing") {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
            }
            return;
        }

        // Reset state for new exam session
        isExitingIntentionally.current = false;
        violationTriggered.current = false;
        isGracePeriod.current = true;

        // Grace period (1.5s) to allow browser animation, fullscreen prompt, and initial layout paint
        const graceTimer = setTimeout(() => {
            isGracePeriod.current = false;
        }, 1500);

        const handleSecurityViolation = (reason: string) => {
            if (isExitingIntentionally.current || violationTriggered.current || isGracePeriod.current) {
                return;
            }
            violationTriggered.current = true;
            isExitingIntentionally.current = true;

            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
            }

            toast.error(`Security Violation: ${reason}. Exam has been submitted automatically.`, {
                duration: 6000,
            });
            onSubmitRef.current(reason);
        };

        const handleFullscreenChange = () => {
            if (isExitingIntentionally.current || violationTriggered.current || isGracePeriod.current) {
                return;
            }
            // If fullscreen is supported and document is no longer in fullscreen
            if (isFullscreenSupported() && !isDocumentFullscreen()) {
                handleSecurityViolation("Exited fullscreen mode");
            }
        };

        const handleVisibilityChange = () => {
            if (isExitingIntentionally.current || violationTriggered.current || isGracePeriod.current) {
                return;
            }
            if (document.visibilityState === "hidden") {
                handleSecurityViolation("Switched browser tabs or minimized window");
            }
        };

        const handleWindowBlur = () => {
            if (isExitingIntentionally.current || violationTriggered.current || isGracePeriod.current) {
                return;
            }

            // Debounce blur by 800ms to avoid false positives from native dropdowns/system prompts
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = setTimeout(() => {
                if (isExitingIntentionally.current || violationTriggered.current || isGracePeriod.current) {
                    return;
                }
                // Confirm focus was genuinely lost or window hidden
                if (typeof document !== "undefined" && (!document.hasFocus() || document.visibilityState === "hidden")) {
                    handleSecurityViolation("Lost window focus");
                }
            }, 800);
        };

        const handleWindowFocus = () => {
            // Cancel pending blur violation if window regained focus quickly
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.warning("Right click is disabled during the exam.");
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Function keys (F12, F5, F11)
            if (e.key === "F12" || e.keyCode === 123) {
                e.preventDefault();
                toast.warning("Developer tools are disabled.");
                return;
            }

            if (e.key === "F5" || (e.key === "r" && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                toast.warning("Refreshing is disabled during the exam.");
                return;
            }

            if (e.key === "F11") {
                // Prevent browser toggle conflict
                e.preventDefault();
                return;
            }

            const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            // Devtools shortcuts: Ctrl+Shift+I/J/C or Cmd+Option+I/J/C
            if (
                (modifier && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)) ||
                (isMac && modifier && e.altKey && ["i", "I", "j", "J", "c", "C"].includes(e.key))
            ) {
                e.preventDefault();
                toast.warning("Developer tools are disabled.");
                return;
            }

            // View source: Ctrl+U / Cmd+Option+U
            if ((modifier && (e.key === "u" || e.key === "U")) || (isMac && modifier && e.altKey && (e.key === "u" || e.key === "U"))) {
                e.preventDefault();
                toast.warning("Viewing source is disabled.");
                return;
            }

            // Save page: Ctrl+S / Cmd+S
            if (modifier && (e.key === "s" || e.key === "S")) {
                e.preventDefault();
                toast.warning("Saving page is disabled.");
                return;
            }

            // Print: Ctrl+P / Cmd+P
            if (modifier && (e.key === "p" || e.key === "P")) {
                e.preventDefault();
                toast.warning("Printing is disabled during the exam.");
                return;
            }

            // Copy/Cut/Paste outside input fields
            const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            const isInput = targetTag === "input" || targetTag === "textarea";
            if (!isInput && modifier && ["c", "v", "x", "C", "V", "X"].includes(e.key)) {
                e.preventDefault();
                toast.warning("Copying and pasting are disabled.");
                return;
            }
        };

        const handleClipboard = (e: ClipboardEvent) => {
            const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (targetTag !== "input" && targetTag !== "textarea") {
                e.preventDefault();
            }
        };

        const handleSelectStart = (e: Event) => {
            const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (targetTag !== "input" && targetTag !== "textarea") {
                e.preventDefault();
            }
        };

        // Attach listeners across vendors
        const fullscreenEvents = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
        fullscreenEvents.forEach(evt => {
            document.addEventListener(evt, handleFullscreenChange);
            window.addEventListener(evt, handleFullscreenChange);
        });

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown, { capture: true });

        document.addEventListener("copy", handleClipboard);
        document.addEventListener("cut", handleClipboard);
        document.addEventListener("paste", handleClipboard);
        document.addEventListener("selectstart", handleSelectStart);

        return () => {
            clearTimeout(graceTimer);
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
            }

            fullscreenEvents.forEach(evt => {
                document.removeEventListener(evt, handleFullscreenChange);
                window.removeEventListener(evt, handleFullscreenChange);
            });

            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown, { capture: true });

            document.removeEventListener("copy", handleClipboard);
            document.removeEventListener("cut", handleClipboard);
            document.removeEventListener("paste", handleClipboard);
            document.removeEventListener("selectstart", handleSelectStart);
        };
    }, [step, onSubmitRef]);

    return { enterFullscreen, exitFullscreen };
}

