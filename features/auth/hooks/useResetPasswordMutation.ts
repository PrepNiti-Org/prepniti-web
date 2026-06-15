import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useResetPasswordMutation() {
    const router = useRouter();
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success("Password Updated", {
                description: data.message || "Your password has been reset successfully. Please log in.",
            });
            router.push("/login");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || error.message || "Something went wrong";
            toast.error("Reset Failed", {
                description: msg,
            });
        },
    });
}
