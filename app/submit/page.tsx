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
                    <Card className="bg-primary/[0.03] dark:bg-primary/[0.01] border-primary/10 shadow-sm rounded-xl overflow-hidden">
                        <CardHeader className="pb-3 border-b border-primary/5 bg-gradient-to-r from-primary/[0.02] to-transparent">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold text-primary">
                                <Info className="h-4.5 w-4.5 shrink-0" />
                                Submission Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-xs space-y-3 text-muted-foreground">
                            <p>• <strong>Be Specific:</strong> Mention the exam year, board panel name (e.g. Bassi, Shukla), and your optional subject/stream.</p>
                            <p>• <strong>DAF & Questions:</strong> List questions asked about your background (DAF), optional subjects, current affairs, and case studies/situations.</p>
                            <p>• <strong>Respect Privacy:</strong> Do not share personal contact details or the specific names of board members.</p>
                            <p>• <strong>Formatting:</strong> Organize your review into segments (e.g., DAF questions, Current Affairs, Situational) for easy reading.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Why Share?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• Help future aspirants prepare better.</p>
                            <p>• Document and remember your own journey.</p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}