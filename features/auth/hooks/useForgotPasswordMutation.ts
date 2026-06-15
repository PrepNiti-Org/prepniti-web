import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api";
import { toast } from "sonner";

export function useForgotPasswordMutation(onSuccessCallback?: () => void) {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success("Request Successful", {
                description: data.message || "A reset link has been dispatched.",
            });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || error.message || "Something went wrong";
            toast.error("Request Failed", {
                description: msg,
            });
        },
    });
}
