"use client";

import { motion } from "framer-motion";

interface StopwatchDisplayProps {
    formattedTime: string; 
    elapsedSeconds: number;
    isRunning: boolean;
}

export function StopwatchDisplay({
    formattedTime,
    elapsedSeconds,
    isRunning,
}: StopwatchDisplayProps) {
    const secondHandAngle = (elapsedSeconds / 60) * 360;

    return (
        <div className="relative flex flex-col items-center justify-center select-none py-2 max-w-sm mx-auto">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-linear-to-b from-neutral-900 via-neutral-950 to-neutral-900 p-2 sm:p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-center">
                {Array.from({ length: 60 }).map((_, i) => {
                    const isMajor = i % 5 === 0;
                    const rotation = i * 6;
                    return (
                        <div
                            key={i}
                            className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom pointer-events-none"
                            style={{
                                height: "50%",
                                transform: `rotate(${rotation}deg)`,
                            }}
                        >
                            <div
                                className={`mx-auto rounded-full ${
                                    isMajor
                                        ? "w-0.75 sm:w-1 h-3 sm:h-3.5 bg-white/90"
                                        : "w-0.5 h-1.5 bg-white/25"
                                }`}
                            />
                        </div>
                    );
                })}

                <div className="absolute top-4 sm:top-5 text-xs sm:text-sm font-bold font-mono text-white/90">60</div>
                <div className="absolute right-4 sm:right-5 text-xs sm:text-sm font-bold font-mono text-white/90">15</div>
                <div className="absolute bottom-4 sm:bottom-5 text-xs sm:text-sm font-bold font-mono text-white/90">30</div>
                <div className="absolute left-4 sm:left-5 text-xs sm:text-sm font-bold font-mono text-white/90">45</div>

                <div className="absolute top-18 sm:top-20 z-10 flex items-center justify-center px-4 py-1.5 rounded-full bg-black/85 border border-white/15 backdrop-blur-md shadow-inner text-center">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider">
                        {formattedTime}
                    </span>
                </div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    animate={{ rotate: secondHandAngle }}
                    transition={{
                        type: isRunning ? "spring" : "tween",
                        stiffness: 350,
                        damping: 24,
                    }}
                >
                    <div className="relative w-1 h-full flex flex-col items-center justify-center">
                        <div className="absolute bottom-1/2 w-0.75 sm:w-1 h-[42%] bg-red-500 rounded-t-full shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-red-500" />
                        </div>

                        <div className="absolute top-1/2 w-2 h-5 -mt-1 bg-red-600 rounded-b-full shadow-xs" />
                    </div>
                </motion.div>

                <div className="absolute z-25 w-3.5 h-3.5 rounded-full bg-linear-to-tr from-neutral-300 to-white border-2 border-neutral-900 shadow-md" />
            </div>
        </div>
    );
}
