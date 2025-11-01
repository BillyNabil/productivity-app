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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 bg-card backdrop-blur">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your productivity journey
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
              <p className="text-sm mt-1.5 flex items-center gap-1">
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
              placeholder="Enter your password"
              {...register("password")}
              className={`h-11 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm mt-1.5 flex items-center gap-1 text-destructive">
                <span>⚠️</span> {errors.password.message}
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
                Signing in...
              </span>
            ) : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold hover:underline text-foreground"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

