"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, UserProfile } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    target_exam: z.string().max(50).optional(),
    is_public: z.boolean(),
});

interface EditProfileDialogProps {
    user: UserProfile;
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user.username || "",
            bio: user.bio || "",
            target_exam: user.target_exam || "",
            is_public: user.is_public !== undefined ? user.is_public : true,
        },
    });

    const mutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setOpen(false);
            toast.success("Profile Updated", { description: "Your changes have been saved." });
        },
        onError: (error: unknown) => {
            toast.error("Update Failed", {
                description: (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Something went wrong."
            });
        },
    });

    const formIsPublic = form.watch("is_public");

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate({
            username: values.username,
            bio: values.bio || "",
            target_exam: values.target_exam || "",
            is_public: values.is_public,
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your public profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="target_exam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Exam</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full bg-background border-border focus-visible:ring-primary/20">
                                                <SelectValue placeholder="Select target exam" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UPSC">UPSC</SelectItem>
                                            <SelectItem value="JEE">JEE</SelectItem>
                                            <SelectItem value="NEET">NEET</SelectItem>
                                            <SelectItem value="GATE">GATE</SelectItem>
                                            <SelectItem value="CAT">CAT</SelectItem>
                                            <SelectItem value="SSC">SSC CGL</SelectItem>
                                            <SelectItem value="Bank">Bank</SelectItem>
                                            <SelectItem value="Teaching">Teaching</SelectItem>
                                            <SelectItem value="State PCS">State PCS</SelectItem>
                                            <SelectItem value="Defence">Defence</SelectItem>
                                            <SelectItem value="Law">Law</SelectItem>
                                            <SelectItem value="Nursing">Nursing</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_public"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Visibility</FormLabel>
                                    <Select 
                                        onValueChange={(val) => field.onChange(val === "true")} 
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full bg-background border-border focus-visible:ring-primary/20">
                                                <SelectValue placeholder="Select visibility" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Public (Shareable URL)</SelectItem>
                                            <SelectItem value="false">Buddy Only (Private)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell the community a bit about yourself..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}