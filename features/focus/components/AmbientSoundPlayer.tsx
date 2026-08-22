"use client";

import { useState, useEffect } from "react";
import {
    Volume2,
    VolumeX,
    CloudRain,
    Waves,
    Radio,
    Brain,
    Music,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

export function AmbientSoundPlayer() {
    const [currentSound, setCurrentSound] = useState<AmbientSoundType>("none");
    const [volume, setVolume] = useState(50);
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

    const getIcon = (type: AmbientSoundType) => {
        switch (type) {
            case "rain":
                return <CloudRain className="w-3.5 h-3.5 text-foreground/80" />;
            case "waves":
                return <Waves className="w-3.5 h-3.5 text-foreground/80" />;
            case "brown_noise":
                return <Radio className="w-3.5 h-3.5 text-foreground/80" />;
            case "alpha_waves":
                return <Brain className="w-3.5 h-3.5 text-foreground/80" />;
            default:
                return <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />;
        }
    };

    const isPlaying = currentSound !== "none";

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full gap-1.5 h-8 px-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        isPlaying
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {isPlaying ? (
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <span className="font-bold">
                                {AMBIENT_SOUND_OPTIONS.find((s) => s.id === currentSound)?.label}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5" />
                            <span>Sound</span>
                        </div>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl space-y-3" align="end">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40 text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> Ambient Soundscapes
                    </span>
                    {isPlaying && (
                        <button
                            type="button"
                            onClick={() => handleSelectSound("none")}
                            className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                        >
                            Mute
                        </button>
                    )}
                </div>

                <div className="space-y-1">
                    {AMBIENT_SOUND_OPTIONS.map((opt) => {
                        const isSelected = currentSound === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectSound(opt.id)}
                                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                        : "text-foreground/80 hover:bg-muted"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {getIcon(opt.id)}
                                    <span>{opt.label}</span>
                                </div>
                                {isSelected && <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold">On</span>}
                            </button>
                        );
                    })}
                </div>

                <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> Volume
                        </span>
                        <span>{volume}%</span>
                    </div>
                    <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
