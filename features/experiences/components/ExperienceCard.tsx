import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExperienceProps {
    exam_name: string;
    verdict: string;
    difficulty: string;
    year: number;
}

export function ExperienceCard({ data }: { data: ExperienceProps }) {
    const isSelected = data.verdict.toLowerCase() === "selected";

    return (
        <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{data.exam_name}</CardTitle>
                <Badge variant={isSelected ? "default" : "destructive"}>
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