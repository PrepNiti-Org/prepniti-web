"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, KeyRound, EyeOff, Cookie, Scale } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      id: "intro",
      title: "1. Privacy Commitment",
      icon: <EyeOff className="h-4 w-4 text-primary" />,
      content:
        "PrepNiti is founded on the principle of anonymous information sharing. We build tools that protect your identity while allowing you to contribute helpful preparation reviews and insights. We do not sell, trade, or share your email or personal details with anyone.",
    },
    {
      id: "anonymity",
      title: "2. Absolute Anonymity",
      icon: <ShieldAlert className="h-4 w-4 text-primary" />,
      content:
        "When submitting interview experiences, candidates can choose to toggle 'Anonymous'. In this mode, no user-specific profile records are linked to the public article. Even internal log fields remove identity linkages to guarantee you cannot be identified by exam boards or peers.",
    },
    {
      id: "cookies",
      title: "3. Local Session Cookies",
      icon: <Cookie className="h-4 w-4 text-primary" />,
      content:
        "We use standard browser cookies only to keep you logged in and to remember your theme preference. We do not use any advertising trackers, third-party analytics, or profiling tools on this platform.",
    },
    {
      id: "security",
      title: "4. Data Encryption & Security",
      icon: <KeyRound className="h-4 w-4 text-primary" />,
      content:
        "Your password is stored securely and never stored as plain text. All data is transmitted over an encrypted connection so it cannot be intercepted in transit.",
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2 pb-6 border-b border-border/60"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Scale className="h-3.5 w-3.5" /> Legal center
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">
          Last updated: June 16, 2026. Review how we manage and safeguard your data.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:block md:col-span-1 space-y-2 sticky top-20 h-fit">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-3">
            Table of Contents
          </p>
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
            >
              {sec.icon}
              <span>{sec.title.split(" ").slice(1).join(" ")}</span>
            </a>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          {sections.map((sec, idx) => (
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              id={sec.id}
              className="scroll-mt-24"
            >
              <Card className="border-border bg-card/30 hover:border-primary/15 transition-all">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                      {sec.icon}
                    </span>
                    {sec.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{sec.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
