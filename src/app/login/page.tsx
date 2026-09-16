"use client";

import { loginAction } from "@/actions/auth";
import { Button, Input } from "@/components/ui";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result.success) {
      toast.success("Logged in successfully!");
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] w-full flex items-center justify-center -mt-6">
      <div className="w-full max-w-5xl h-[600px] bg-white/40 dark:bg-stone-900/40 backdrop-blur-2xl border border-stone-200/50 dark:border-stone-800/50 rounded-3xl shadow-2xl overflow-hidden flex relative z-10">
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex w-1/2 relative bg-stone-950 overflow-hidden flex-col justify-between p-12">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/30 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 w-fit backdrop-blur-md border border-white/10 text-white font-semibold tracking-tight text-sm mb-12">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>ACME Corp</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Manage your <br />
              <span className="text-amber-400">global workforce</span> <br />
              with clarity.
            </h1>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-stone-400 text-sm">
            <span>Enterprise Salary Management</span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-600"></span>
            <span>Version 2.0</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white/60 dark:bg-stone-950/60 backdrop-blur-md relative">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile Branding (hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-white">
                ACME
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2 tracking-tight">
                Welcome back
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Enter your credentials to access the system.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Work Email"
                name="email"
                type="email"
                placeholder="jane.doe@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-stone-400" />}
                required
                disabled={isLoading}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-stone-400" />}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 h-11 text-sm group"
                isLoading={isLoading}
                rightIcon={
                  !isLoading && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )
                }
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-200/50 dark:border-stone-800/50 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Protected by Enterprise SSO. <br />
                Having trouble?{" "}
                <a
                  href="#"
                  className="font-medium text-stone-700 dark:text-stone-300 hover:underline"
                >
                  Contact IT Support
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
