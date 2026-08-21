import { ExamCategory } from "../types";

export const EXAM_CATEGORIES: ExamCategory[] = [
    {
        id: "UPSC",
        label: "UPSC / Civil Services",
        suggestions: ["UPSC CSE (Prelims)", "UPSC CSE (Mains)", "UPSC EPFO", "UPSC CDS", "UPSC CAPF", "UPSC NDA", "Indian Forest Service (IFS)"],
    },
    {
        id: "Banking",
        label: "Banking & Insurance",
        suggestions: ["SBI PO", "SBI Clerk", "IBPS PO", "IBPS Clerk", "IBPS RRB", "RBI Grade B", "RBI Assistant", "LIC AAO", "NABARD Grade A"],
    },
    {
        id: "SSC",
        label: "SSC (Staff Selection Commission)",
        suggestions: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC GD Constable", "SSC MTS", "SSC Stenographer", "SSC JE"],
    },
    {
        id: "State PSC",
        label: "State PSC / State Exams",
        suggestions: ["UPPSC", "BPSC", "MPPSC", "MPSC", "RAS / RPSC", "TNPSC", "WBPSC", "APPSC", "KPSC", "State Police SI"],
    },
    {
        id: "GATE",
        label: "GATE / Engineering",
        suggestions: ["GATE CS / IT", "GATE Mechanical", "GATE Electrical", "GATE Civil", "GATE Electronics (ECE)", "ESE / IES"],
    },
    {
        id: "CAT",
        label: "Management (CAT / MBA)",
        suggestions: ["CAT", "XAT", "SNAP", "NMAT", "IIFT", "MAT", "CMAT"],
    },
    {
        id: "Defence",
        label: "Defence Services",
        suggestions: ["NDA", "CDS", "AFCAT", "Indian Navy INET", "Indian Coast Guard", "Territorial Army"],
    },
    {
        id: "Law",
        label: "Law & Judiciary",
        suggestions: ["CLAT UG", "CLAT PG", "AILET", "Judicial Services Exam (PCS-J)", "DU LLB", "SLAT"],
    },
    {
        id: "Teaching",
        label: "Teaching & Academics",
        suggestions: ["UGC NET", "CSIR NET", "CTET", "State TET", "KVS / NVS PRT/TGT/PGT", "Super TET"],
    },
    {
        id: "Medical",
        label: "Medical / NEET",
        suggestions: ["NEET UG", "NEET PG", "INI-CET", "AIIMS Nursing", "FMGE"],
    },
    {
        id: "JEE",
        label: "Undergrad Engineering (JEE)",
        suggestions: ["JEE Main", "JEE Advanced", "BITSAT", "WBJEE", "MHT CET"],
    },
    {
        id: "Other",
        label: "Other Examination",
        suggestions: [],
    }
];

export function getCategoryById(id?: string): ExamCategory | undefined {
    if (!id) return undefined;
    return EXAM_CATEGORIES.find(c => c.id.toLowerCase() === id.toLowerCase());
}

export function getExamSuggestions(category?: string): string[] {
    const found = getCategoryById(category);
    return found ? found.suggestions : [];
}
