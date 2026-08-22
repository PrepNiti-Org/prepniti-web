"use client";

export type AmbientSoundType = "none" | "rain" | "waves" | "brown_noise" | "alpha_waves";

export interface AmbientSoundOption {
    id: AmbientSoundType;
    label: string;
    icon: string;
    description: string;
}

export const AMBIENT_SOUND_OPTIONS: AmbientSoundOption[] = [
    { id: "none", label: "Off", icon: "VolumeX", description: "Silence" },
    { id: "rain", label: "Gentle Rain", icon: "CloudRain", description: "Soothing rain & droplets" },
    { id: "waves", label: "Ocean Waves", icon: "Waves", description: "Rhythmic tide surf" },
    { id: "brown_noise", label: "Deep Brown Noise", icon: "Radio", description: "Warm focus hum" },
    { id: "alpha_waves", label: "432Hz Alpha", icon: "Brain", description: "Binaural memory focus" },
];

class AmbientSoundEngine {
    private ctx: AudioContext | null = null;
    private currentSound: AmbientSoundType = "none";
    private masterGain: GainNode | null = null;
    private activeNodes: (AudioNode | number)[] = [];
    private volume: number = 0.5;

    private initContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public setVolume(val: number) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    public getVolume(): number {
        return this.volume;
    }

    public getCurrentSound(): AmbientSoundType {
        return this.currentSound;
    }

    public stop() {
        this.currentSound = "none";
        this.cleanupNodes();
    }

    private cleanupNodes() {
        this.activeNodes.forEach((node) => {
            if (typeof node === "number") {
                clearInterval(node);
            } else {
                try {
                    if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
                        (node as AudioScheduledSourceNode).stop();
                    }
                    node.disconnect();
                } catch {
                }
            }
        });
        this.activeNodes = [];
    }

    public play(type: AmbientSoundType) {
        if (type === "none") {
            this.stop();
            return;
        }

        if (typeof window === "undefined") return;
        const ctx = this.initContext();

        this.cleanupNodes();
        this.currentSound = type;

        const master = ctx.createGain();
        master.gain.setValueAtTime(this.volume, ctx.currentTime);
        master.connect(ctx.destination);
        this.masterGain = master;
        this.activeNodes.push(master);

        switch (type) {
            case "rain":
                this.generateRain(ctx, master);
                break;
            case "waves":
                this.generateWaves(ctx, master);
                break;
            case "brown_noise":
                this.generateBrownNoise(ctx, master);
                break;
            case "alpha_waves":
                this.generateAlphaWaves(ctx, master);
                break;
        }
    }

    private generateRain(ctx: AudioContext, destination: GainNode) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            output[i] = (b0 + b1 + b2 + white * 0.05) * 0.11;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(300, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(highpass);
        highpass.connect(destination);

        whiteNoise.start();
        this.activeNodes.push(whiteNoise, filter, highpass);
    }

    private generateWaves(ctx: AudioContext, destination: GainNode) {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.28, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);

        source.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(destination);

        source.start();
        lfo.start();
        this.activeNodes.push(source, filter, waveGain, lfo, lfoGain);
    }

    private generateBrownNoise(ctx: AudioContext, destination: GainNode) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(500, ctx.currentTime);

        source.connect(lowpass);
        lowpass.connect(destination);

        source.start();
        this.activeNodes.push(source, lowpass);
    }

    private generateAlphaWaves(ctx: AudioContext, destination: GainNode) {
        const oscLeft = ctx.createOscillator();
        oscLeft.type = "sine";
        oscLeft.frequency.setValueAtTime(216, ctx.currentTime);

        const oscRight = ctx.createOscillator();
        oscRight.type = "sine";
        oscRight.frequency.setValueAtTime(226, ctx.currentTime);

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0.12, ctx.currentTime);

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (last + 0.01 * white) / 1.01;
            last = data[i];
            data[i] *= 1.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(300, ctx.currentTime);

        oscLeft.connect(toneGain);
        oscRight.connect(toneGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(destination);
        toneGain.connect(destination);

        oscLeft.start();
        oscRight.start();
        noise.start();
        this.activeNodes.push(oscLeft, oscRight, toneGain, noise, noiseFilter);
    }
}

export const ambientSound = new AmbientSoundEngine();
