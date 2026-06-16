"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExperience, Experience } from "@/features/experiences/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil } from "lucide-react";

const formSchema = z.object({
    exam_name: z.string().min(2, "Exam name is required."),
    year: z.coerce.number().min(2000).max(new Date().getFullYear() + 1),
    verdict: z.string().min(1, "Please select a verdict."),
    difficulty: z.string().min(1, "Please select a difficulty level."),
    description: z.string().min(50, "Please write at least 50 characters."),
    is_anonymous: z.boolean().default(false),
});

export function EditExperienceModal({ post }: { post: Experience }) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            exam_name: post.exam_name,
            year: post.year,
            verdict: post.verdict,
            difficulty: post.difficulty,
            description: post.description,
            is_anonymous: post.is_anonymous,
        },
    });

    const mutation = useMutation({
        mutationFn: updateExperience,
        onSuccess: () => {
            toast.success("Experience updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
            queryClient.invalidateQueries({ queryKey: ["experiences-feed"] });
            setIsOpen(false);
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            toast.error("Update failed", {
                description: error.response?.data?.error || "Failed to save changes."
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate({ id: post.id.toString(), data: values });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Experience</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="exam_name" render={({ field }) => (
                                <FormItem><FormLabel>Exam Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="year" render={({ field }) => (
                                <FormItem><FormLabel>Attempt Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="verdict" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Final Verdict</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Selected">Selected</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                            <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="difficulty" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Interview Difficulty</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                            <SelectItem value="Brutal">Brutal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detailed Experience</FormLabel>
                                <FormControl>
                                    <MarkdownEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Describe the interview process, questions asked, and your strategy..."
                                        className="border-primary/20 focus-within:ring-primary/40 focus-within:border-primary"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="is_anonymous" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-normal cursor-pointer">Post Anonymously</FormLabel>
                            </FormItem>
                        )} />

                        <div className="flex justify-end pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="mr-2">Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}