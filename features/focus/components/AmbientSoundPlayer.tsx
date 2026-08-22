"use client";

import { useState, useEffect } from "react";
import {
    Volume1,
    Volume2,
    VolumeX,
    CloudRain,
    Waves,
    Radio,
    Brain,
    Headphones,
    Check,
} from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ambientSound,
    AmbientSoundType,
    AMBIENT_SOUND_OPTIONS,
} from "../utils/ambientSound";

interface AmbientSoundPlayerProps {
    inZenMode?: boolean;
}

export function AmbientSoundPlayer({ inZenMode = false }: AmbientSoundPlayerProps) {
    const [currentSound, setCurrentSound] = useState<AmbientSoundType>("none");
    const [volume, setVolume] = useState(50);
    const [prevVolume, setPrevVolume] = useState(50);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        return () => {
            ambientSound.stop();
        };
    }, []);

    const handleSelectSound = (type: AmbientSoundType) => {
        if (currentSound === type) {
            ambientSound.stop();
            setCurrentSound("none");
        } else {
            ambientSound.setVolume(volume / 100);
            ambientSound.play(type);
            setCurrentSound(type);
        }
    };

    const handleVolumeChange = (vals: number[]) => {
        const val = vals[0] ?? 50;
        setVolume(val);
        ambientSound.setVolume(val / 100);
    };

    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            handleVolumeChange([0]);
        } else {
            handleVolumeChange([prevVolume > 0 ? prevVolume : 50]);
        }
    };

    const getVolumeIcon = () => {
        if (volume === 0) return <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />;
        if (volume <= 50) return <Volume1 className="w-3.5 h-3.5 text-foreground/80" />;
        return <Volume2 className="w-3.5 h-3.5 text-foreground/80" />;
    };

    const getIcon = (type: AmbientSoundType, isSelected: boolean) => {
        const cls = `w-4 h-4 shrink-0 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground"}`;
        switch (type) {
            case "rain":
                return <CloudRain className={cls} />;
            case "waves":
                return <Waves className={cls} />;
            case "brown_noise":
                return <Radio className={cls} />;
            case "alpha_waves":
                return <Brain className={cls} />;
            default:
                return <VolumeX className={cls} />;
        }
    };

    const isPlaying = currentSound !== "none";
    const activeOption = AMBIENT_SOUND_OPTIONS.find((s) => s.id === currentSound);

    const triggerButtonClass = inZenMode
        ? isPlaying
            ? "bg-white/15 hover:bg-white/20 text-white border-white/25 backdrop-blur-md shadow-xs"
            : "text-white/80 hover:text-white hover:bg-white/15 border-transparent"
        : isPlaying
            ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/15 shadow-2xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/80 border-border/40 bg-background/80 shadow-2xs";

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer select-none ${triggerButtonClass}`}
                >
                    {isPlaying ? (
                        <>
                            <div className="flex items-end gap-0.5 h-2.5">
                                <span className={`w-0.5 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2 ${inZenMode ? "bg-white" : "bg-primary"}`} />
                                <span className={`w-0.5 rounded-full animate-[pulse_1.1s_ease-in-out_infinite_150ms] h-2.5 ${inZenMode ? "bg-white" : "bg-primary"}`} />
                                <span className={`w-0.5 rounded-full animate-[pulse_0.9s_ease-in-out_infinite_300ms] h-1.5 ${inZenMode ? "bg-white" : "bg-primary"}`} />
                            </div>
                            <span className="font-semibold truncate max-w-28">
                                {activeOption?.label || "Sound"}
                            </span>
                        </>
                    ) : (
                        <>
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Audio</span>
                        </>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-64 p-3 rounded-2xl bg-popover/95 backdrop-blur-2xl border border-border/50 shadow-xl space-y-2.5"
                align="end"
                sideOffset={8}
            >
                {/* Minimal Header */}
                <div className="flex items-center justify-between px-1 pb-1.5 border-b border-border/40">
                    <span className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                        Ambient Audio
                    </span>
                    {isPlaying && (
                        <button
                            type="button"
                            onClick={() => handleSelectSound("none")}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                            Turn off
                        </button>
                    )}
                </div>

                {/* Minimal Sound List */}
                <div className="space-y-0.5">
                    {AMBIENT_SOUND_OPTIONS.filter((opt) => opt.id !== "none").map((opt) => {
                        const isSelected = currentSound === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectSound(opt.id)}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-primary/10 text-primary font-semibold dark:bg-primary/15"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {getIcon(opt.id, isSelected)}
                                    <span>{opt.label}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                <div className="pt-2 border-t border-border/40 space-y-1.5 px-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors font-medium"
                        >
                            {getVolumeIcon()}
                            <span>Volume</span>
                        </button>
                        <span className="font-mono text-[10px] text-muted-foreground font-medium">
                            {volume === 0 ? "Muted" : `${volume}%`}
                        </span>
                    </div>

                    <SliderPrimitive.Root
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="relative flex w-full touch-none select-none items-center py-1.5 cursor-pointer group"
                    >
                        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted-foreground/20">
                            <SliderPrimitive.Range className="absolute h-full bg-primary" />
                        </SliderPrimitive.Track>
                        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white dark:bg-foreground border border-black/15 dark:border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 active:scale-120 focus-visible:outline-none cursor-grab active:cursor-grabbing" />
                    </SliderPrimitive.Root>
                </div>
            </PopoverContent>
        </Popover>
    );
}
