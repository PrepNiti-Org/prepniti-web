"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost, Post } from "@/features/posts/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    FormDescription,
} from "@/components/ui/form";
import { Loader2, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(20, "Content must be at least 20 characters").max(5000, "Content is too long"),
    tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

export interface EditPostModalProps {
    post: Post;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function EditPostModal({ post, trigger, onSuccess }: EditPostModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: post.title,
            content: post.content,
            tags: post.tags || [],
        },
    });

    const watchedTags = form.watch("tags");

    const mutation = useMutation({
        mutationFn: updatePost,
        onSuccess: () => {
            toast.success("Post updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", post.id] });
            queryClient.invalidateQueries({ queryKey: ["my-discussions"] });
            setIsOpen(false);
            onSuccess?.();
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            toast.error(error.response?.data?.error || "Failed to update post");
        },
    });

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = tagInput.trim().toLowerCase();
            const currentTags = form.getValues("tags");

            if (val && !currentTags.includes(val) && currentTags.length < 5) {
                form.setValue("tags", [...currentTags, val]);
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags");
        form.setValue("tags", currentTags.filter((t) => t !== tagToRemove));
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate({
            id: post.id,
            data: {
                title: values.title,
                content: values.content,
                tags: values.tags,
            },
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8 rounded-lg">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Post</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="What is on your mind?"
                                            className="text-base py-5 border-primary/40 focus-visible:ring-primary/40 focus-visible:border-primary"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Content</FormLabel>
                                    <FormControl>
                                        <MarkdownEditor
                                            placeholder="Provide details, context, and examples..."
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="border-primary/45 focus-within:ring-primary/40 focus-within:border-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tags"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Tags</FormLabel>
                                    <FormDescription className="text-xs text-muted-foreground/80">
                                        Press Enter or comma to add a tag. Maximum 5 tags.
                                    </FormDescription>
                                    <FormControl>
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="e.g. upsc, strategy, motivation"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleAddTag}
                                                disabled={watchedTags.length >= 5}
                                                className="border-primary/40 focus-visible:ring-primary/40 focus-visible:border-primary"
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <AnimatePresence>
                                                    {watchedTags.map((tag) => (
                                                        <motion.div
                                                            key={tag}
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.8, opacity: 0 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                        >
                                                            <Badge variant="secondary" className="px-3 py-1 text-xs rounded-full flex items-center space-x-1 font-semibold border-primary/10">
                                                                <span>#{tag}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive hover:bg-transparent"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </Badge>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="rounded-lg font-semibold">
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
