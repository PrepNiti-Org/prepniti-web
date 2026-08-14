"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function FeedbackPage() {
  const { user, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setEmail(user.email);
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a feedback category");
      return;
    }
    if (!isLoggedIn && !email.trim()) {
      toast.error("Email is required for guests");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Feedback message must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/feedback", {
        email,
        category,
        message,
      });

      toast.success("Feedback submitted successfully!");
      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setCategory("");
    setSubmitted(false);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {submitted ? (
              <Card className="border-primary/20 shadow-lg rounded-2xl overflow-hidden bg-card/50 backdrop-blur-xl py-12 text-center relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                <CardContent className="space-y-6 relative z-10 flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20 shadow-inner">
                    <CheckCircle2 className="h-12 w-12 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                      Your feedback has been recorded. The development team reviews every suggestion to build a better community for aspirants.
                    </CardDescription>
                  </div>
                  <Button onClick={handleReset} className="font-semibold cursor-pointer">
                    Submit More Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/20 shadow-sm rounded-xl overflow-hidden bg-card relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <CardHeader className="pb-6 border-b border-border/40 relative z-10 bg-gradient-to-r from-primary/[0.05] via-primary/[0.01] to-transparent">
                  <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Share Your Feedback
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 text-muted-foreground">
                    Have a bug to report, a feature suggestion, or general feedback about PrepNiti? Let us know!
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 relative z-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full border-primary/30 bg-muted/20">
                          <SelectValue placeholder="Select feedback category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUG">Bug Report</SelectItem>
                          <SelectItem value="FEATURE">Feature Request</SelectItem>
                          <SelectItem value="SUPPORT">General Support</SelectItem>
                          <SelectItem value="COMMUNITY">Community Concerns</SelectItem>
                          <SelectItem value="OTHER">Other Suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!isLoggedIn && (
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="yourname@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-primary/30 focus-visible:ring-primary/40 focus-visible:border-primary"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Email is required for contact updates.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please explain in detail what happened, or describe the requested feature..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[160px] text-base resize-y border-primary/30 focus-visible:ring-primary/40 focus-visible:border-primary"
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Min 10 characters</span>
                        <span>{message.length} characters</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg shadow-md hover:shadow-lg transition-all font-semibold cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Send Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20 h-fit">
          <Card className="border-primary/25 shadow-sm rounded-xl overflow-hidden bg-card">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/[0.05] to-transparent border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Good Feedback Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3.5 text-muted-foreground leading-relaxed">
              <div>
                <h4 className="font-bold text-foreground mb-0.5">Be Specific</h4>
                <p>For bug reports, tell us exactly what steps lead to the error or describe where it happened.</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-0.5">Focus on Use-cases</h4>
                <p>For feature requests, explain why it would help you or other peer aspirants in their exam prep.</p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-0.5">Suggest Solutions</h4>
                <p>If you have a workflow design in mind, feel free to outline it. We love collaborating on designs!</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
