"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, uploadMedia, CreatePostDTO } from "@/features/posts/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, X, UploadCloud } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(20, "Content must be at least 20 characters").max(5000, "Content is too long"),
    tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

export default function CreatePostPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [tagInput, setTagInput] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: [],
        },
    });

    const watchedTags = form.watch("tags");

    const mutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post created successfully!");
            router.push("/posts");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create post");
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let mediaUrl;
            let mediaType;

            if (mediaFile) {
                setIsUploading(true);
                const uploadRes = await uploadMedia(mediaFile);
                mediaUrl = uploadRes.url;
                mediaType = uploadRes.type;
                setIsUploading(false);
            }

            mutation.mutate({
                ...values,
                media_url: mediaUrl,
                media_type: mediaType,
            });
        } catch (error) {
            toast.error("Failed to upload media");
            setIsUploading(false);
        }
    }

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);

            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
    };

    return (
        <div className="container max-w-3xl py-10">
            <Link href="/posts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Discussions
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-muted/60 shadow-lg">
                    <CardHeader className="pb-6 border-b border-muted/30">
                        <CardTitle className="text-3xl font-extrabold">Create a New Post</CardTitle>
                        <CardDescription className="text-base mt-1">
                            Share a question, strategy, or thought with the community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="What's on your mind?" className="text-lg py-6" {...field} />
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
                                            <FormLabel className="text-base font-semibold">Content</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide details, context, and examples..."
                                                    className="min-h-[250px] text-base resize-y"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <FormLabel className="text-base font-semibold">Attach Media (Optional)</FormLabel>
                                    {!mediaFile ? (
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/5 hover:bg-muted/20 border-primary/20 hover:border-primary/50 transition-all">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                                    <UploadCloud className="w-8 h-8 mb-2" />
                                                    <p className="mb-1 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs">PNG, JPG, GIF, MP4 (Max 10MB)</p>
                                                </div>
                                                <Input id="dropzone-file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-border bg-card">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full shadow-md"
                                                onClick={removeMedia}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            {mediaFile.type.startsWith("image/") ? (
                                                <img src={mediaPreview!} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-black/5" />
                                            ) : (
                                                <video src={mediaPreview!} controls className="w-full h-auto max-h-[400px] bg-black/5" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Tags</FormLabel>
                                            <FormDescription>
                                                Press enter or comma to add a tag. Maximum 5 tags.
                                            </FormDescription>
                                            <FormControl>
                                                <div className="space-y-3">
                                                    <Input
                                                        placeholder="e.g. upsc, strategy, motivation"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        disabled={watchedTags.length >= 5}
                                                    />
                                                    <div className="flex flex-wrap gap-2">
                                                        {watchedTags.map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm rounded-full flex items-center space-x-1">
                                                                <span>#{tag}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="mr-3"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="lg" disabled={mutation.isPending || isUploading}>
                                        {mutation.isPending || isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {isUploading ? "Uploading Media..." : "Publishing..."}
                                            </>
                                        ) : (
                                            "Publish Post"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
