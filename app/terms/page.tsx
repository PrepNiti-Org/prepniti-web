"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Hammer, UserCheck, ShieldCheck, HeartHandshake, FileText } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      id: "conduct",
      title: "1. Community Conduct",
      icon: <Hammer className="h-4 w-4 text-primary" />,
      content:
        "PrepNiti is an educational forum. Users agree not to post defamatory, offensive, or harassing material. All discussions, experiences, and notes must relate directly to competitive civil service, banking, or state government exams.",
    },
    {
      id: "accounts",
      title: "2. Account Guidelines",
      icon: <UserCheck className="h-4 w-4 text-primary" />,
      content:
        "You are responsible for protecting your account password and session authorization states. You must choose usernames that do not impersonate public officials, exam boards, or other users.",
    },
    {
      id: "moderation",
      title: "3. Content Moderation",
      icon: <ShieldCheck className="h-4 w-4 text-primary" />,
      content:
        "Administrators reserve the right to edit, archive, or permanently delete posts or user records that violate community values, promote commercial packages, or expose raw personal identity details.",
    },
    {
      id: "ip",
      title: "4. Licensing & Content Rights",
      icon: <HeartHandshake className="h-4 w-4 text-primary" />,
      content:
        "By publishing content on PrepNiti, you grant the community a non-exclusive, worldwide, royalty-free license to host, index, and display your interview transcripts to other aspirants. Author ownership is retained by you.",
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
          <FileText className="h-3.5 w-3.5" /> Agreement rules
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">
          Last updated: June 16, 2026. Read the guidelines governing our peer forum.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2 sticky top-20 h-fit">
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
