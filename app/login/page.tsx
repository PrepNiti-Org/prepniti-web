import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">

            <div className="hidden bg-slate-900 lg:flex flex-col justify-between p-10 text-white">
                <div className="flex items-center text-lg font-medium">
                    PrepNiti 🇮🇳
                </div>
                <div className="space-y-4">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Success is not final, failure is not fatal: it is the courage to continue that counts.&rdquo;
                        </p>
                        <footer className="text-sm opacity-80">— Winston Churchill</footer>
                    </blockquote>
                </div>
                <div className="text-sm opacity-50">
                    © 2024 PrepNiti Inc.
                </div>
            </div>

            <div className="flex items-center justify-center py-12">
                <div className="mx-auto w-full max-w-[350px] space-y-6">

                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <LoginForm />

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/register" className="hover:text-brand underline underline-offset-4">
                            Don&apos;t have an account? Sign Up
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}