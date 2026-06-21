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
import { ArrowLeft, Loader2, X, UploadCloud, Info, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

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
        <div className="container max-w-7xl mx-auto space-y-6">
            <Link href="/posts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-2 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Discussions
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <div className="lg:col-span-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="border-primary/40 shadow-sm rounded-xl overflow-hidden bg-card">
                            
                            <CardHeader className="pb-6 border-b border-border/40">
                                <CardTitle className="text-2xl font-bold tracking-tight">Create a New Post</CardTitle>
                                <CardDescription className="text-sm mt-1 text-muted-foreground">
                                    Share a question, strategy, or resource with the community.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold">Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="What is on your mind?" className="text-base py-5 border-primary/40 focus-visible:ring-primary/40 focus-visible:border-primary" {...field} />
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

                                        <div className="space-y-3">
                                            <FormLabel className="text-sm font-semibold">Attach Media (Optional)</FormLabel>
                                            {!mediaFile ? (
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 border-primary/20 hover:border-primary/40 hover:bg-muted/20 transition-all duration-200">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground text-center">
                                                            <UploadCloud className="w-8 h-8 mb-2 text-primary/70" />
                                                            <p className="mb-1 text-sm"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                                            <p className="text-xs text-muted-foreground/75 mt-0.5">PNG, JPG, GIF, MP4 (Max 10MB)</p>
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
                                                        <img src={mediaPreview!} alt="Preview" className="w-full h-auto max-h-[350px] object-contain bg-black/5" />
                                                    ) : (
                                                        <video src={mediaPreview!} controls className="w-full h-auto max-h-[350px] bg-black/5" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

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

                                        <div className="pt-4 flex justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.back()}
                                                className="rounded-lg"
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" size="lg" disabled={mutation.isPending || isUploading} className="rounded-lg shadow-md hover:shadow-lg transition-all font-semibold">
                                                {mutation.isPending || isUploading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

                {/* Right Sidebar Column */}
                <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 h-fit">
                    
                    {/* Posting Guidelines Card */}
                    <Card className="border-primary/25 shadow-sm rounded-xl overflow-hidden bg-card">
                        <CardHeader className="pb-3 bg-gradient-to-r from-primary/[0.05] to-transparent border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Info className="h-4.5 w-4.5 text-primary" />
                                Posting Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-xs space-y-3.5 text-muted-foreground">
                            <div>
                                <h4 className="font-bold text-foreground mb-0.5 flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary/80" /> Write a Descriptive Title
                                </h4>
                                <p>Summarize your question or insight in one clear sentence. Keep it relevant to other aspirants.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-0.5">Provide Context & Details</h4>
                                <p>Add background context, preparation material links, or examples to help other peers understand and answer quickly.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-0.5">Use Specific Tags</h4>
                                <p>Add tags like `#upsc`, `#history`, `#notes` so users filtering topics can locate and reply to your discussions.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Values Card */}
                    <Card className="border-primary/25 shadow-sm rounded-xl overflow-hidden bg-card">
                        <CardHeader className="pb-3 bg-gradient-to-r from-secondary/[0.05] to-transparent border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Heart className="h-4.5 w-4.5 text-secondary" />
                                Community Values
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-xs space-y-3 text-muted-foreground">
                            <p>• <strong>Be Respectful:</strong> Keep discussions civil, support peer aspirants, and avoid flame wars.</p>
                            <p>• <strong>Help Others:</strong> If you see a study doubt you can solve, take a minute to explain it!</p>
                            <p>• <strong>Stay Relevant:</strong> Ensure posts focus on civil services, banking, study routines, and competitive exam preparation.</p>
                        </CardContent>
                    </Card>
                    
                    {/* Small Footer Copy */}
                    <p className="text-[11px] text-muted-foreground/50 px-2 mt-2">
                        Need help? Contact community support.
                    </p>
                </div>

            </div>
        </div>
    );
}
