"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, deriveNameFromEmail, deriveAvatar } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "worker" | "shop">("customer");
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "worker") router.replace("/dashboard/provider");
      else if (user.role === "shop") router.replace("/dashboard/shop");
      else router.replace("/");
    }
  }, [user, loading, router]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const name = deriveNameFromEmail(email);
    const avatar = deriveAvatar(name);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); setSubmitting(false); return; }
      login(data);
      if (data.role === "worker") router.push("/dashboard/provider");
      else if (data.role === "shop") router.push("/dashboard/shop");
      else router.push("/");
    } catch {
      setError("Could not connect to server. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading || user) return null;

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
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${role === "customer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              I&apos;m a Customer
            </button>
            <button
              onClick={() => setRole("worker")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${role === "worker" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              I&apos;m a Pro
            </button>
            <button
              onClick={() => setRole("shop")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${role === "shop" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              I&apos;m a Shop
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

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700">
              <span className="font-semibold">Demo:</span> any email &amp; password · first login auto-creates your account
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

            <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-colors">
              {submitting ? "Signing in..." : `Sign In as ${role === "customer" ? "Customer" : role === "shop" ? "Shop" : "Pro"}`}
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
