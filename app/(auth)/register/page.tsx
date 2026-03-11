"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparky } from "@/components/sparky/Sparky";
import { cn } from "@/lib/utils";

const AGE_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 6); // 6-14

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CHILD",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || body.message || "Registration failed. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sparky greeting */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Sparky mood="excited" size={72} />
        </motion.div>
      </div>

      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-text">
          Join LittleSparks!
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Start your learning adventure today
        </p>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role toggle */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue("role", "CHILD")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-4 transition-all duration-200",
                selectedRole === "CHILD"
                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                  : "border-border bg-background text-text-muted hover:border-primary/30"
              )}
            >
              <span className="text-2xl">🧒</span>
              <span className="text-sm font-display font-bold">
                I&apos;m a Kid
              </span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setValue("role", "PARENT")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-4 transition-all duration-200",
                selectedRole === "PARENT"
                  ? "border-secondary bg-secondary/10 text-secondary shadow-lg shadow-secondary/10"
                  : "border-border bg-background text-text-muted hover:border-secondary/30"
              )}
            >
              <span className="text-2xl">👨‍👩‍👧</span>
              <span className="text-sm font-display font-bold">
                I&apos;m a Parent
              </span>
            </motion.button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              id="name"
              type="text"
              placeholder="Your awesome name"
              className="pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              id="email"
              type="email"
              placeholder="sparky@example.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Kid-specific fields */}
        <AnimatePresence>
          {selectedRole === "CHILD" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Age dropdown */}
              <div>
                <label
                  htmlFor="age"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  How old are you?
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <select
                    id="age"
                    className="flex h-10 w-full appearance-none rounded-md border border-border bg-background px-3 py-2 text-sm text-text font-body ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200"
                    {...register("age", { valueAsNumber: true })}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select your age
                    </option>
                    {AGE_OPTIONS.map((age) => (
                      <option key={age} value={age}>
                        {age} years old
                      </option>
                    ))}
                  </select>
                </div>
                {errors.age && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Parent email (optional) */}
              <div>
                <label
                  htmlFor="parentEmail"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Parent&apos;s Email{" "}
                  <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@example.com"
                    className="pl-10"
                    {...register("parentEmail")}
                  />
                </div>
                {errors.parentEmail && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.parentEmail.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
