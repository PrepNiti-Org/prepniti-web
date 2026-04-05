import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">

            <div className="hidden bg-blue-900 lg:flex flex-col justify-between p-10 text-white">
                <div className="flex items-center text-lg font-medium">
                    PrepNiti 🇮🇳
                </div>
                <div className="space-y-4">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;The future belongs to those who believe in the beauty of their dreams.&rdquo;
                        </p>
                        <footer className="text-sm opacity-80">— Eleanor Roosevelt</footer>
                    </blockquote>
                </div>
                <div className="text-sm opacity-50">
                    Join the community of aspirants.
                </div>
            </div>

            <div className="flex items-center justify-center py-12">
                <div className="mx-auto w-full max-w-[350px] space-y-6">

                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>

                    <RegisterForm />

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/login" className="hover:text-brand underline underline-offset-4">
                            Already have an account? Login
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}