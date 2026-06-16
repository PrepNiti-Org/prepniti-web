import { CreateExperienceForm } from "@/features/experiences/components/CreateExperienceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function SubmitPage() {
    return (
        <div className="container max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Share Your Experience</h1>
                        <p className="text-muted-foreground mt-2">
                            Share your interview journey to help thousands of other aspirants.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
                        <CreateExperienceForm />
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-1 space-y-6">
                    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Info className="h-5 w-5" />
                                Submission Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3 text-slate-600 dark:text-slate-300">
                            <p>1. <strong>Be Specific:</strong> Mention the exam year, board, and panel details if possible.</p>
                            <p>2. <strong>Questions:</strong> List the technical and HR questions asked.</p>
                            <p>3. <strong>Respect Privacy:</strong> Do not share personal phone numbers or sensitive details of interviewers.</p>
                            <p>4. <strong>Formatting:</strong> Use bullet points for readability.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Why Share?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• Help future aspirants.</p>
                            <p>• Document your own journey.</p>
                            <p>• Earn community karma (Coming soon!).</p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}