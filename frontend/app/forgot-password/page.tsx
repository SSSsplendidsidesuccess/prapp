"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResetLink("");
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(true);
      setResetLink(response.reset_link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-lg p-8 shadow-xl border border-slate-800">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-slate-400 mb-6">
            Enter your email address and we'll send you a password reset link.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  Password reset link has been generated!
                </p>
              </div>

              {/* For testing: Show the reset link */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-300 text-sm mb-2 font-medium">
                  Testing Mode - Reset Link:
                </p>
                <div className="bg-slate-950 rounded p-3 mb-3">
                  <p className="text-xs text-slate-400 break-all font-mono">
                    {resetLink}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const url = new URL(resetLink);
                    window.location.href = url.pathname + url.search;
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                >
                  Go to Reset Password Page
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-yellow-500 hover:text-yellow-400"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-slate-400">
                  Remember your password?{" "}
                  <Link href="/login" className="text-yellow-500 hover:text-yellow-400">
                    Sign in
                  </Link>
                </p>
                <Link
                  href="/"
                  className="text-sm text-slate-500 hover:text-slate-400 block"
                >
                  ← Back to home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}