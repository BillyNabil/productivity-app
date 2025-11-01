"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/services/user-settings-service";
import { CheckCircle2, Sparkles } from "lucide-react";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Ensure user settings are created (fallback for trigger)
      if (authData?.user?.id) {
        const settingsCreated = await ensureUserSettings(supabase);
        if (!settingsCreated) {
          console.warn("Warning: Could not ensure user settings were created");
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-2 bg-white dark:bg-black backdrop-blur">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white dark:text-black" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Account Created!
            </h2>
            <p className="mb-2">
              Welcome to ProductivityHub!
            </p>
            <p className="text-sm">
              Check your email to verify your account, or continue to the dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 bg-card backdrop-blur">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start your productivity journey today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2 text-foreground"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`h-11 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-sm mt-1.5 flex items-center gap-1 text-destructive">
                <span>⚠️</span> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2 text-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              {...register("password")}
              className={`h-11 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm mt-1.5 flex items-center gap-1 text-destructive">
                <span>⚠️</span> {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-2 text-foreground"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
              className={`h-11 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm mt-1.5 flex items-center gap-1 text-destructive">
                <span>⚠️</span> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-3">
              <p className="text-sm font-medium text-destructive">⚠️ {error}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                Creating account...
              </span>
            ) : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline text-foreground"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}


