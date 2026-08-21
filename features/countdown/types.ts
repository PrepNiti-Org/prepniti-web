export interface Wallpaper {
    id: string;
    title: string;
    url: string;
}

export interface ExamCategory {
    id: string;
    label: string;
    suggestions: string[];
}

export interface MotivationalQuote {
    quote: string;
    author: string;
}

export interface TargetExamInfo {
    category: string;
    name: string;
    date: Date;
    dateStr: string;
}

export interface CountdownUnits {
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isDDay: boolean;
}
