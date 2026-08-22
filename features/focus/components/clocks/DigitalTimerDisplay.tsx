"use client";

const STRAIGHT_SEGMENTS: Record<string, string> = {
    a: "M 7 2 L 37 2 L 33 7 L 11 7 Z",
    b: "M 38 3 L 43 7 L 43 34 L 38 38 L 34 34 L 34 7 Z",
    c: "M 38 40 L 43 44 L 43 71 L 38 75 L 34 71 L 34 44 Z",
    d: "M 7 76 L 37 76 L 33 71 L 11 71 Z",
    e: "M 6 40 L 10 44 L 10 71 L 6 75 L 1 71 L 1 44 Z",
    f: "M 6 3 L 10 7 L 10 34 L 6 38 L 1 34 L 1 7 Z",
    g: "M 8 39 L 12 35 L 32 35 L 36 39 L 32 43 L 12 43 Z",
};

const NUM_MAP: Record<string, string[]> = {
    "0": ["a", "b", "c", "d", "e", "f"],
    "1": ["b", "c"],
    "2": ["a", "b", "g", "e", "d"],
    "3": ["a", "b", "g", "c", "d"],
    "4": ["f", "g", "b", "c"],
    "5": ["a", "f", "g", "c", "d"],
    "6": ["a", "f", "g", "e", "c", "d"],
    "7": ["a", "b", "c"],
    "8": ["a", "b", "c", "d", "e", "f", "g"],
    "9": ["a", "b", "c", "d", "f", "g"],
};

function StraightLCDDigit({ digit }: { digit: string }) {
    const active = new Set(NUM_MAP[digit] || []);

    return (
        <svg
            viewBox="0 0 44 78"
            className="w-16 h-28 sm:w-20 sm:h-36 md:w-24 md:h-44 text-foreground"
        >
            {Object.entries(STRAIGHT_SEGMENTS).map(([key, path]) => (
                <path
                    key={`bg-${key}`}
                    d={path}
                    className="fill-foreground/3"
                />
            ))}

            {Object.entries(STRAIGHT_SEGMENTS).map(([key, path]) => {
                if (!active.has(key)) return null;
                return (
                    <path
                        key={`lit-${key}`}
                        d={path}
                        className="fill-foreground transition-colors duration-75"
                    />
                );
            })}
        </svg>
    );
}

interface DigitalTimerDisplayProps {
    formattedTime: string;
}

export function DigitalTimerDisplay({
    formattedTime,
}: DigitalTimerDisplayProps) {
    const parts = formattedTime.split(":");
    const isHours = parts.length === 3;
    const minStr = (isHours ? parts[1] : parts[0])?.padStart(2, "0") || "00";
    const secStr = (isHours ? parts[2] : parts[1])?.padStart(2, "0") || "00";

    return (
        <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-7 py-3 select-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
                <StraightLCDDigit digit={minStr[0] || "0"} />
                <StraightLCDDigit digit={minStr[1] || "0"} />
            </div>

            <div className="flex flex-col gap-6 sm:gap-8 px-1 sm:px-2">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs bg-foreground" />
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs bg-foreground" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
                <StraightLCDDigit digit={secStr[0] || "0"} />
                <StraightLCDDigit digit={secStr[1] || "0"} />
            </div>
        </div>
    );
}
