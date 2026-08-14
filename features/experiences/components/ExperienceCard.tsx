import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExperienceProps {
    exam_name: string;
    verdict: string;
    difficulty: string;
    year: number;
}

const getVerdictBadgeStyles = (verdict: string) => {
    switch (verdict.toLowerCase()) {
        case "selected":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-semibold";
        case "rejected":
            return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 font-semibold";
        case "waitlist":
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 font-semibold";
        default:
            return "bg-muted text-muted-foreground border-border font-semibold";
    }
};

export function ExperienceCard({ data }: { data: ExperienceProps }) {
    return (
        <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{data.exam_name}</CardTitle>
                <Badge variant="outline" className={getVerdictBadgeStyles(data.verdict)}>
                    {data.verdict}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Year: {data.year}</span>
                    <span className="capitalize">Difficulty: {data.difficulty}</span>
                </div>
            </CardContent>
        </Card>
    );
}