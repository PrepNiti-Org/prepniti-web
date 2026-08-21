import { Wallpaper } from "../types";

export const FOCUS_WALLPAPERS: Wallpaper[] = [
    {
        id: "midnight-alps",
        title: "Midnight Alps",
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "space-nebula",
        title: "Cosmic Horizon",
        url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "aurora-borealis",
        title: "Northern Aurora",
        url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "pine-mist",
        title: "Mist Pines",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "starlit-sky",
        title: "Starlit Range",
        url: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "desert-nightfall",
        title: "Desert Nightfall",
        url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "silent-summits",
        title: "Silent Summits",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "deep-ocean-twilight",
        title: "Deep Ocean Twilight",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "cloud-inversion",
        title: "Mountain Cloud Inversion",
        url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "yosemite-valley",
        title: "Yosemite Dusk",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "redwood-canopy",
        title: "Enchanted Redwoods",
        url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "canyon-starlight",
        title: "Canyon Starlight",
        url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "moonlit-coast",
        title: "Moonlit Coast",
        url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2560&q=85",
    },
    {
        id: "icelandic-mood",
        title: "Nordic Waters",
        url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2560&q=85",
    }
];

export function getDailyWallpaper(date: Date = new Date()): Wallpaper {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = Math.abs(dayOfYear) % FOCUS_WALLPAPERS.length;
    return FOCUS_WALLPAPERS[index];
}
