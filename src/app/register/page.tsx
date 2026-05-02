"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories } from "@/data/categories";
import { useAuth, deriveAvatar } from "@/context/AuthContext";

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "worker" ? "worker" : "customer";

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"customer" | "worker">(initialRole);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", location: "", category: "", bio: "", rate: "" });

  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "worker" ? "/dashboard/provider" : "/");
    }
  }, [user, loading, router]);

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    login({
      id: `user-${Date.now()}`,
      name: formData.name || "User",
      email: formData.email,
      role,
      avatar: deriveAvatar(formData.name || "U"),
    });
    router.push(role === "worker" ? "/dashboard/provider" : "/");
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">Servy</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 mt-1">Join 50,000+ users on Servy</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? "✓" : s}
              </div>
              {s < 2 && <div className={`h-0.5 w-16 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Role selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${role === "customer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              I need services
            </button>
            <button
              onClick={() => setRole("worker")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${role === "worker" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
            >
              I offer services
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input type="text" value={formData.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {role === "worker" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
                      <select value={formData.category} onChange={(e) => update("category", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select your primary service...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                      <input type="number" value={formData.rate} onChange={(e) => update("rate", e.target.value)} placeholder="e.g. 75" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">About You</label>
                      <textarea value={formData.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell customers about your experience, certifications, and what makes you great..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-2">
              {step === 1 ? "Continue" : role === "customer" ? "Create Account" : "Join as a Pro"}
            </button>
          </form>

          {step === 1 && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">OR</div>
              </div>
              <div className="space-y-2">
                {["Google", "Apple"].map((p) => (
                  <button key={p} className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold text-gray-700 transition-colors">
                    <span className="text-lg">{p === "Google" ? "G" : "🍎"}</span>
                    Continue with {p}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-600">Terms</a> and{" "}
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
