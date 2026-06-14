import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useExamSecurity(step: string, onSubmitRef: React.MutableRefObject<() => void>) {
    const isExitingIntentionally = useRef(false);

    const enterFullscreen = async () => {
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
            }
        } catch (err) {
            console.error("Failed to enter fullscreen mode:", err);
            toast.warning("Fullscreen mode request was rejected. Please ensure browser permissions are granted.");
        }
    };

    const exitFullscreen = async () => {
        const doc = document as any;
        isExitingIntentionally.current = true;
        try {
            if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
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
            console.error("Failed to exit fullscreen mode:", err);
        }
    };

    useEffect(() => {
        if (step !== "testing") return;

        const handleSecurityViolation = (reason: string) => {
            if (isExitingIntentionally.current) return;
            isExitingIntentionally.current = true;
            toast.error(`Security Violation: ${reason}. Exam submitted automatically.`);
            onSubmitRef.current();
        };

        const handleFullscreenChange = () => {
            const doc = document as any;
            const isFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
            if (isExitingIntentionally.current) {
                return;
            }
            if (!isFullscreen && step === "testing") {
                handleSecurityViolation("Exited fullscreen mode");
            }
        };

        const handleVisibilityChange = () => {
            if (isExitingIntentionally.current) return;
            if (document.visibilityState === "hidden") {
                handleSecurityViolation("Switched browser tabs / minimized window");
            }
        };

        const handleWindowBlur = () => {
            if (isExitingIntentionally.current) return;
            handleSecurityViolation("Lost window focus");
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.warning("Right click is disabled during the exam.");
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F12" || e.keyCode === 123) {
                e.preventDefault();
                toast.warning("Developer tools are disabled.");
                return;
            }

            const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "C" || e.key === "V" || e.key === "X")) {
                e.preventDefault();
                toast.warning("Copying, pasting, and cutting are disabled.");
                return;
            }

            if (modifier && e.shiftKey && (e.key === "i" || e.key === "I")) {
                e.preventDefault();
                toast.warning("Developer tools are disabled.");
                return;
            }
            if (isMac && modifier && e.altKey && (e.key === "i" || e.key === "I")) {
                e.preventDefault();
                toast.warning("Developer tools are disabled.");
                return;
            }

            if (modifier && (e.key === "u" || e.key === "U")) {
                e.preventDefault();
                toast.warning("Viewing source is disabled.");
                return;
            }
            if (isMac && modifier && e.altKey && (e.key === "u" || e.key === "U")) {
                e.preventDefault();
                toast.warning("Viewing source is disabled.");
                return;
            }

            if (modifier && (e.key === "s" || e.key === "S")) {
                e.preventDefault();
                toast.warning("Saving page is disabled.");
                return;
            }

            if (e.key === "F5" || (modifier && (e.key === "r" || e.key === "R"))) {
                e.preventDefault();
                toast.warning("Refreshing is disabled during the exam.");
                return;
            }
        };

        const handleClipboard = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const handleSelectStart = (e: Event) => {
            e.preventDefault();
        };

        // Attach listeners
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        document.addEventListener("copy", handleClipboard);
        document.addEventListener("cut", handleClipboard);
        document.addEventListener("paste", handleClipboard);
        document.addEventListener("selectstart", handleSelectStart);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);

            document.removeEventListener("copy", handleClipboard);
            document.removeEventListener("cut", handleClipboard);
            document.removeEventListener("paste", handleClipboard);
            document.removeEventListener("selectstart", handleSelectStart);
        };
    }, [step, onSubmitRef]);

    return { enterFullscreen, exitFullscreen };
}
