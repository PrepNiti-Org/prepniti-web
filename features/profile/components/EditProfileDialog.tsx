"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, UserProfile, lookupPincode } from "../api";
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
import { Edit3, Loader2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    target_exam: z.string().max(50).optional(),
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
            is_public: user.is_public !== undefined ? user.is_public : true,
            pincode: user.pincode || "",
        },
    });

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
        // Only auto-resolve if user changed the pincode from what's already saved
        if (pin.length === 6 && /^\d{6}$/.test(pin)) {
            if (pin === user.pincode && user.district && user.state && user.latitude && user.longitude) {
                // Already resolved from server with valid coordinates
                setPincodeStatus("success");
                setResolvedLocation({ district: user.district, state: user.state, latitude: user.latitude, longitude: user.longitude });
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

                        {/* Pincode with auto-resolve */}
                        <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                        Pincode
                                    </FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    placeholder="Enter 6-digit pincode"
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    className="pr-8"
                                                />
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                    {pincodeStatus === "loading" && (
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                    {pincodeStatus === "success" && (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                    {pincodeStatus === "error" && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                            {resolvedLocation && pincodeStatus === "success" && (
                                                <div className="flex items-center gap-2 text-[11px]">
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                                                        {resolvedLocation.district}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                                                        {resolvedLocation.state}
                                                    </span>
                                                </div>
                                            )}
                                            {pincodeStatus === "error" && (
                                                <p className="text-[11px] text-red-500 font-medium">
                                                    Invalid pincode. Please check and try again.
                                                </p>
                                            )}
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