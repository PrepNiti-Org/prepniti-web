import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRegisterMutation() {
    const router = useRouter();
    return useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            toast.success("Account Created!", { description: "Please login with your new account." });
            router.push("/login");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || "Registration Failed";
            console.log("Registration error:", error);
            toast.error("Error", { description: msg });
        },
    });
}
