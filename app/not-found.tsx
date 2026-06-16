import { Button } from "@/components/ui/button";
import { HelpCircle, Home } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 space-y-6">
      <div className="relative border border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-6 overflow-hidden shadow-lg shadow-primary/5 bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20 shadow-inner">
            <HelpCircle className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/85">
              404 - Page Not Found
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/">
              <Button className="font-semibold shadow-md transition-all cursor-pointer">
                <Home className="mr-2 h-4 w-4" /> Go to Home Feed
              </Button>
            </Link>
            <Link href="/posts">
              <Button
                variant="outline"
                className="bg-background shadow-sm hover:bg-muted/50 transition-all cursor-pointer"
              >
                Browse Discussions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
