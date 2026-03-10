"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BookOpen,
  Brain,
  Gamepad2,
  BarChart3,
  Users,
  Star,
  Award,
  Rocket,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparky } from "@/components/sparky/Sparky";

/* ------------------------------------------------------------------ */
/*  Reusable scroll-reveal wrapper                                     */
/* ------------------------------------------------------------------ */
function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course Card (marketing variant)                                    */
/* ------------------------------------------------------------------ */
const courses = [
  {
    title: "Vedic Maths",
    description:
      "Lightning-fast mental calculation techniques from ancient India. Multiply, divide, and square numbers in seconds!",
    icon: Brain,
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    badge: "Active",
    badgeVariant: "default" as const,
    link: "/courses",
  },
  {
    title: "Abacus",
    description:
      "Train your brain to visualize numbers with the world's oldest calculating tool. Build number sense from the ground up.",
    icon: Gamepad2,
    color: "from-secondary/20 to-secondary/5",
    border: "border-secondary/30",
    badge: "Coming Soon",
    badgeVariant: "secondary" as const,
    link: null,
  },
  {
    title: "STEM Lab",
    description:
      "Hands-on experiments in science, technology, engineering, and math. Turn curiosity into discovery.",
    icon: Rocket,
    color: "from-accent/20 to-accent/5",
    border: "border-accent/30",
    badge: "Coming Soon",
    badgeVariant: "accent" as const,
    link: null,
  },
];

/* ------------------------------------------------------------------ */
/*  How It Works steps                                                 */
/* ------------------------------------------------------------------ */
const steps = [
  {
    step: 1,
    title: "Pick a Course",
    description:
      "Choose from Vedic Maths, Abacus, or STEM Lab. Each course is crafted for ages 6-14.",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: 2,
    title: "Learn with Sparky",
    description:
      "Our friendly mascot guides you through bite-sized lessons with fun animations and tips.",
    icon: Sparkles,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    step: 3,
    title: "Earn Stars & Badges",
    description:
      "Complete lessons and quizzes to earn stars, unlock badges, and climb the leaderboard!",
    icon: Award,
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

/* ------------------------------------------------------------------ */
/*  Features list                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: "Interactive Lessons",
    description:
      "Step-by-step lessons with visual aids, animations, and practice problems that make learning stick.",
    icon: Zap,
    color: "text-primary",
  },
  {
    title: "Fun Quizzes",
    description:
      "Timed quizzes that feel like games. Earn bonus stars for speed and accuracy.",
    icon: Gamepad2,
    color: "text-secondary",
  },
  {
    title: "Track Progress",
    description:
      "Watch your skills grow with XP bars, streak counters, and detailed progress reports.",
    icon: BarChart3,
    color: "text-accent",
  },
  {
    title: "Parent Portal",
    description:
      "Parents get a dedicated dashboard to monitor activity, progress, and learning milestones.",
    icon: Users,
    color: "text-primary",
  },
];

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[90vh] flex items-center justify-center star-bg">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center">
          {/* Sparky floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <Sparky mood="excited" size={100} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-text"
          >
            Where Little Minds
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ignite Big Ideas
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-text-muted font-body leading-relaxed"
          >
            Master Vedic Maths, sharpen your mind with Abacus, and explore STEM
            — all through interactive lessons, fun quizzes, and a friendly
            mascot named Sparky. Built for curious kids ages 6-14.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/register">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8">
              <Link href="/register?role=parent">
                I&apos;m a Parent
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent" />
              100% Free to Start
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent" />
              Kid-Safe & Ad-Free
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent" />
              Parent Dashboard
            </span>
          </motion.div>
        </div>
      </section>

      {/* ============ COURSE PREVIEW ============ */}
      <section className="relative py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Our Courses
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
              Learn Something{" "}
              <span className="text-primary">Amazing</span>
            </h2>
            <p className="mt-4 text-text-muted max-w-xl mx-auto">
              Courses designed by education experts, powered by gamification,
              and loved by thousands of kids.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((course, i) => (
              <ScrollReveal key={course.title} delay={i * 0.15}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card
                    className={`relative overflow-hidden bg-gradient-to-br ${course.color} ${course.border} h-full`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50">
                          <course.icon className="h-6 w-6 text-text" />
                        </div>
                        <Badge variant={course.badgeVariant}>
                          {course.badge}
                        </Badge>
                      </div>
                      <h3 className="font-display text-xl font-bold text-text mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed mb-4">
                        {course.description}
                      </p>
                      {course.link ? (
                        <Button size="sm" asChild>
                          <Link href={course.link}>
                            Explore Course
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 bg-surface/50">
        <div className="mx-auto max-w-5xl px-4">
          <ScrollReveal className="text-center mb-16">
            <Badge variant="accent" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
              Three Steps to{" "}
              <span className="text-accent">Brilliance</span>
            </h2>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.15}>
                <div className="text-center">
                  {/* Step number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${s.bg} mb-6`}
                  >
                    <s.icon className={`h-8 w-8 ${s.color}`} />
                  </motion.div>

                  {/* Connector line (hidden on mobile, shown between items) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-border" />
                  )}

                  <div className="mb-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                    Step {s.step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-text mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
              Everything Your Child Needs to{" "}
              <span className="text-primary">Thrive</span>
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full border-border bg-surface hover:border-primary/30 transition-colors duration-300">
                    <CardContent className="p-6">
                      <feature.icon
                        className={`h-8 w-8 ${feature.color} mb-4`}
                      />
                      <h3 className="font-display text-base font-bold text-text mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="py-24 star-bg relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 pointer-events-none" />
        <ScrollReveal className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <Sparky mood="celebrating" size={80} className="mx-auto mb-6" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
            Ready to Spark Some Learning?
          </h2>
          <p className="text-text-muted mb-8 max-w-lg mx-auto">
            Join thousands of kids already having fun with Vedic Maths. It only
            takes a minute to get started.
          </p>
          <Button size="lg" asChild className="text-base px-10">
            <Link href="/register">
              Create Free Account
              <Star className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </ScrollReveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border bg-surface/50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-display text-lg font-bold text-text">
                  Little<span className="text-primary">Sparks</span>
                </span>
              </Link>
              <p className="text-sm text-text-muted leading-relaxed">
                Where little minds ignite big ideas. Fun, interactive learning
                for kids ages 6-14.
              </p>
            </div>

            {/* Courses */}
            <div>
              <h4 className="font-display text-sm font-bold text-text mb-3">
                Courses
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/courses" className="hover:text-primary transition-colors">
                    Vedic Maths
                  </Link>
                </li>
                <li>
                  <span className="opacity-50">Abacus (Coming Soon)</span>
                </li>
                <li>
                  <span className="opacity-50">STEM Lab (Coming Soon)</span>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-display text-sm font-bold text-text mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/register?role=parent" className="hover:text-primary transition-colors">
                    Parent Portal
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-primary transition-colors">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-display text-sm font-bold text-text mb-3">
                Account
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary transition-colors">
                    Sign Up Free
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} LittleSparks. All rights
              reserved.
            </p>
            <p className="text-xs text-text-muted">
              Made with{" "}
              <span className="text-primary">&hearts;</span> for curious kids
              everywhere.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
