"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "provider">("customer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = role === "customer" ? "/dashboard/customer" : "/dashboard/provider";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">Servy</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Role selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setRole("customer")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${role === "customer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
              I&apos;m a Customer
            </button>
            <button onClick={() => setRole("provider")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${role === "provider" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
              I&apos;m a Pro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">
              Sign In
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">OR</div>
          </div>

          <div className="space-y-2">
            {["Google", "Apple"].map((provider) => (
              <button key={provider} className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold text-gray-700 transition-colors">
                <span className="text-lg">{provider === "Google" ? "G" : "🍎"}</span>
                Continue with {provider}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
