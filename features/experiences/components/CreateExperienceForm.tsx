"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateExperience } from "../hooks/useExperiences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    exam_name: z.string().min(2, "Exam name must be at least 2 characters"),
    year: z.coerce.number().min(2000).max(2030),
    verdict: z.string().min(1, "Please select a verdict"),
    difficulty: z.string().min(1, "Please select difficulty"),
    description: z.string().min(50, "Please share more details (at least 50 chars). Be helpful!"),
    is_anonymous: z.boolean().default(false).optional(),
});

export function CreateExperienceForm() {
    const router = useRouter();
    const mutation = useCreateExperience();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            exam_name: "",
            year: new Date().getFullYear(),
            verdict: undefined,
            difficulty: undefined, 
            description: "",
            is_anonymous: false,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success("Experience Published!", { description: "Your story is now live." });
                router.push("/");
            },
            onError: (err: Error) => {
                const description = err instanceof Error && 'response' in err && (err as AxiosError<{ error: string }>).response?.data?.error 
                    ? (err as AxiosError<{ error: string }>).response?.data?.error 
                    : "Server error";
                toast.error("Failed to post", { description });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="exam_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exam Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. UPSC CSE Mains, SBI PO Interview" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl><Input type="number" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="verdict"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verdict</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Result" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Selected">Selected ✅</SelectItem>
                                        <SelectItem value="Rejected">Rejected ❌</SelectItem>
                                        <SelectItem value="Waitlist">Waitlist ⏳</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficulty</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Experience</FormLabel>
                            <FormControl>
                                <MarkdownEditor
                                    placeholder="Describe the interview process, questions asked, and your strategy..."
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="border-primary/20 focus-within:ring-primary/40 focus-within:border-primary"
                                />
                            </FormControl>
                            <FormDescription>
                                Markdown is supported. Be detailed!
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_anonymous"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-slate-50 dark:bg-slate-900">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Post Anonymously
                            </FormLabel>
                            <FormDescription>
                            Your name and avatar will be hidden from this post.
                            </FormDescription>
                        </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Experience
                    </Button>
                </div>
            </form>
        </Form>
    );
}