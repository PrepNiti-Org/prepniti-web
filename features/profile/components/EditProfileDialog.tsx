"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, UserProfile, lookupPincode } from "../api";
import { EXAM_CATEGORIES, getExamSuggestions } from "@/features/countdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Edit3, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    username: z.string().min(3, "At least 3 characters").max(20),
    bio: z.string().max(160).optional(),
    target_exam: z.string().max(50).optional(),
    target_exam_name: z.string().max(100).optional(),
    target_exam_date: z.string().optional(),
    is_public: z.boolean(),
    pincode: z.string().max(10).optional(),
});

interface EditProfileDialogProps {
    user: UserProfile;
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [resolvedLocation, setResolvedLocation] = useState<{ district: string; state: string; latitude?: number; longitude?: number } | null>(
        user.district && user.state ? { district: user.district, state: user.state, latitude: user.latitude, longitude: user.longitude } : null
    );
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user.username || "",
            bio: user.bio || "",
            target_exam: user.target_exam || "",
            target_exam_name: user.target_exam_name || user.target_exam || "",
            target_exam_date: user.target_exam_date ? user.target_exam_date.split("T")[0] : "",
            is_public: user.is_public !== undefined ? user.is_public : true,
            pincode: user.pincode || "",
        },
    });

    const watchedCategory = form.watch("target_exam");
    const categorySuggestions = useMemo(() => getExamSuggestions(watchedCategory), [watchedCategory]);

    useEffect(() => {
        if (open) {
            form.reset({
                username: user.username || "",
                bio: user.bio || "",
                target_exam: user.target_exam || "",
                target_exam_name: user.target_exam_name || user.target_exam || "",
                target_exam_date: user.target_exam_date ? user.target_exam_date.split("T")[0] : "",
                is_public: user.is_public !== undefined ? user.is_public : true,
                pincode: user.pincode || "",
            });
            if (user.district && user.state) {
                setResolvedLocation({ district: user.district, state: user.state, latitude: user.latitude, longitude: user.longitude });
                setPincodeStatus("success");
            }
        }
    }, [open, user, form]);

    const watchedPincode = form.watch("pincode");

    const resolvePincode = useCallback(async (pin: string) => {
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            setPincodeStatus("idle");
            setResolvedLocation(null);
            return;
        }
        setPincodeStatus("loading");
        const result = await lookupPincode(pin);
        if (result) {
            setPincodeStatus("success");
            setResolvedLocation({ district: result.district, state: result.state, latitude: result.latitude, longitude: result.longitude });
        } else {
            setPincodeStatus("error");
            setResolvedLocation(null);
        }
    }, []);

    useEffect(() => {
        const pin = watchedPincode || "";
        if (pin.length === 6 && /^\d{6}$/.test(pin)) {
            if (pin === user.pincode && user.district && user.state) {
                setPincodeStatus("success");
            } else {
                const timer = setTimeout(() => resolvePincode(pin), 300);
                return () => clearTimeout(timer);
            }
        } else {
            setPincodeStatus("idle");
            setResolvedLocation(null);
        }
    }, [watchedPincode, user.pincode, user.district, user.state, resolvePincode]);

    const mutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            setOpen(false);
            toast.success("Profile updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Failed to update profile");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate({
            username: values.username.trim(),
            bio: values.bio?.trim() || "",
            target_exam: values.target_exam || "",
            target_exam_name: values.target_exam_name?.trim() || values.target_exam || "",
            target_exam_date: values.target_exam_date || undefined,
            is_public: values.is_public,
            pincode: values.pincode || "",
            district: resolvedLocation?.district || "",
            state: resolvedLocation?.state || "",
            latitude: resolvedLocation?.latitude,
            longitude: resolvedLocation?.longitude,
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-semibold cursor-pointer">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto rounded-2xl p-6">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base font-bold">Edit Profile</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-9 text-xs rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="A short note on your preparation..."
                                            className="resize-none text-xs rounded-lg min-h-[60px]"
                                            rows={2}
                                        />
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
                                    <FormLabel className="text-xs">Exam Category (for Mocks & Recommendations)</FormLabel>
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            if (!form.getValues("target_exam_name")) {
                                                const cat = EXAM_CATEGORIES.find(c => c.id === val);
                                                if (cat?.suggestions?.length) {
                                                    form.setValue("target_exam_name", cat.suggestions[0]);
                                                }
                                            }
                                        }} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-9 text-xs w-full rounded-lg">
                                                <SelectValue placeholder="Select examination category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-lg">
                                            {EXAM_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="target_exam_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Specific Exam Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. SBI PO 2026"
                                                className="h-9 text-xs rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="target_exam_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Target Exam Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="h-9 text-xs rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {categorySuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {categorySuggestions.slice(0, 4).map(suggestion => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => form.setValue("target_exam_name", suggestion)}
                                        className="px-2 py-0.5 rounded-md text-[10px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs flex items-center justify-between">
                                        <span>Pincode (for Buddy Match)</span>
                                        {resolvedLocation && pincodeStatus === "success" && (
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                {resolvedLocation.district}, {resolvedLocation.state}
                                            </span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder="6-digit pincode"
                                                maxLength={6}
                                                className="h-9 text-xs pr-8 rounded-lg"
                                            />
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                {pincodeStatus === "loading" && (
                                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                )}
                                                {pincodeStatus === "success" && (
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_public"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Profile Visibility</FormLabel>
                                    <Select 
                                        onValueChange={(val) => field.onChange(val === "true")} 
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-9 text-xs w-full rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-lg">
                                            <SelectItem value="true" className="text-xs">Public</SelectItem>
                                            <SelectItem value="false" className="text-xs">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpen(false)}
                                className="h-8 text-xs cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                size="sm"
                                className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer px-4"
                            >
                                {mutation.isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}