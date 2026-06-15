import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { AxiosError } from "axios";

export function useLoginMutation() {
    const { login } = useAuth();
    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data.token, data.user);
            toast.success("Welcome back!", {
                description: `Hello, ${data.user.username}!`,
            });
            window.location.href = "/";
        },
        onError: (error: AxiosError<{ error: string }>) => {
            toast.error("Login Failed", {
                description: error.response?.data?.error || error.message || "Something went wrong",
            });
        },
    });
}
