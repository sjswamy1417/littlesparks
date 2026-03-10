"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Heart,
  Target,
  Eye,
  Brain,
  Lightbulb,
  Calculator,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparky } from "@/components/sparky/Sparky";

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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const vedicTechniques = [
  {
    title: "Nikhilam Sutra",
    description:
      "Multiply numbers near a base (like 10, 100) in seconds. For example, 97 x 96 becomes trivial with this mental shortcut.",
    icon: Calculator,
  },
  {
    title: "Urdhva Tiryagbhyam",
    description:
      "The \"vertically and crosswise\" method lets you multiply any two numbers using a simple criss-cross pattern.",
    icon: Brain,
  },
  {
    title: "Ekadhikena Purvena",
    description:
      "Quickly square numbers ending in 5, find complements, and perform division — all mentally.",
    icon: Lightbulb,
  },
];

const values = [
  {
    title: "Our Mission",
    description:
      "To make mathematics joyful and accessible for every child. We believe that when learning feels like play, knowledge sticks for life.",
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Our Vision",
    description:
      "A world where every child discovers the beauty of numbers and develops the confidence to tackle any mathematical challenge with a smile.",
    icon: Eye,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    title: "Our Values",
    description:
      "Curiosity over perfection. Progress over speed. Fun over fear. We celebrate every small spark of understanding.",
    icon: Heart,
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 star-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <Sparky mood="proud" size={90} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl font-extrabold text-text mb-6"
          >
            Sparking a Love for{" "}
            <span className="text-primary">Numbers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed"
          >
            LittleSparks was born from a simple idea: what if learning maths
            felt like an adventure? We combine ancient Vedic wisdom with modern
            gamification to create an experience kids actually look forward to.
          </motion.p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.15}>
                <Card className="h-full border-border bg-surface hover:border-primary/20 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} mb-5`}
                    >
                      <item.icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-text mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How Vedic Maths Works */}
      <section className="py-24 bg-surface/50">
        <div className="mx-auto max-w-5xl px-4">
          <ScrollReveal className="text-center mb-16">
            <Badge className="mb-4">Ancient Wisdom, Modern Fun</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
              What is{" "}
              <span className="text-primary">Vedic Maths</span>?
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Vedic Mathematics is a system of mental calculation techniques
              rediscovered from ancient Indian scriptures (the Vedas) by
              Sri Bharati Krishna Tirtha. These 16 sutras (formulas) turn
              complex arithmetic into simple, elegant patterns that anyone
              can learn.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {vedicTechniques.map((tech, i) => (
              <ScrollReveal key={tech.title} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full border-border bg-background">
                    <CardContent className="p-6">
                      <tech.icon className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-display text-lg font-bold text-text mb-2">
                        {tech.title}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {tech.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-display text-sm font-bold text-primary uppercase tracking-wider">
                    Example
                  </span>
                </div>
                <p className="font-display text-2xl font-bold text-text mb-2">
                  98 &times; 97 = ?
                </p>
                <p className="text-text-muted text-sm max-w-md mx-auto">
                  Using the Nikhilam Sutra: both numbers are near 100.
                  Deficiencies are 2 and 3. Cross-subtract: 98 - 3 = 95.
                  Multiply deficiencies: 2 &times; 3 = 06. Answer:{" "}
                  <span className="font-mono font-bold text-accent">
                    9506
                  </span>
                  . Done in seconds!
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Vision */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <ScrollReveal>
            <Sparky mood="thinking" size={70} className="mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-text mb-6">
              Built by Educators, Loved by Kids
            </h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Our team brings together experienced maths educators, child
              psychologists, and software engineers. We obsess over every
              interaction — from the bounce of a button to the timing of a
              confetti blast — because we know that delight and learning go
              hand in hand.
            </p>
            <p className="text-text-muted leading-relaxed">
              We are committed to keeping LittleSparks ad-free, privacy-first,
              and accessible to learners everywhere. Every child deserves the
              chance to discover that maths is not scary — it is magic.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
