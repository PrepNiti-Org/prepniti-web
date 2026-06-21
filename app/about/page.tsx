"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, BookOpen, CheckSquare, Users, Award, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function AboutPage() {
  const stats = [
    { label: "Verified Reviews", value: "2,500+" },
    { label: "Active Aspirants", value: "10,000+" },
    { label: "Syllabus Completed", value: "150k+ hrs" },
    { label: "Success Rate", value: "98.2%" },
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Anonymity Preserved",
      description: "Share real exam questions, verdicts, and board reviews safely without exposing your identity or social profile.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Syllabus Analytics",
      description: "Break down civil services and banking syllabus topics. Log daily preparation times and see visual heatmap heat logs.",
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-primary" />,
      title: "Self Assessment",
      description: "Examine your retention with mock questions, interactive option matching, and standard performance metrics.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Peer Discussions",
      description: "Collaborate directly, discuss doubts, ask exam queries, and receive guidance from experienced candidates.",
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative border border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-4 overflow-hidden shadow-lg shadow-primary/5 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent"
      >
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="h-3.5 w-3.5" /> Our Mission
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
            Empowering Aspirants.<br className="hidden sm:block" /> Sharing Real Journeys.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            PrepNiti is an open, candidate-centric community designed for civil service and banking exam preparation. We bridge the gap between aspirants by sharing raw, unedited, and verified interview transcripts.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="h-full border border-border/80 bg-card/45 hover:bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.02] transition-all duration-300">
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 w-fit bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                  {feat.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 fill-secondary" /> Why PrepNiti?
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Created for aspirants, by former candidates.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Standard guidance packages cost thousands, yet lack the actual field insights of candidates who sat in front of the interview boards.
          </p>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            By enabling anonymous post sharing and structured exam checklists, we ensure that every aspirant—regardless of their background, location, or financial status—gains access to the ultimate prep guidebooks.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link href="/register">
              <Button className="shadow-md hover:shadow-lg transition-all font-semibold cursor-pointer">
                Join Community
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant="outline" className="bg-background shadow-sm hover:bg-muted/50 transition-all cursor-pointer">
                Explore Discussions
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card/30 to-muted/20 text-center space-y-1 hover:border-primary/20 transition-all duration-200"
            >
              <p className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
