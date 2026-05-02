"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import ProviderCard from "@/components/ProviderCard";
import { useAuth } from "@/context/AuthContext";
import type { ServiceCategory, Provider } from "@/types";

const stats = [
  { value: "50,000+", label: "Verified Pros" },
  { value: "2M+", label: "Jobs Completed" },
  { value: "4.8★", label: "Average Rating" },
  { value: "150+", label: "Service Types" },
];

const howItWorks = [
  { step: "1", title: "Tell us what you need", desc: "Search by service type or browse categories. Add your location and requirements.", icon: "🔍" },
  { step: "2", title: "Choose your pro", desc: "Compare verified professionals by rating, price, and reviews. Pick the best fit.", icon: "👤" },
  { step: "3", title: "Book instantly", desc: "Select a date and time that works for you. Get instant confirmation.", icon: "📅" },
  { step: "4", title: "Job done, pay safely", desc: "Payment is only released when you're satisfied with the work.", icon: "✅" },
];

const testimonials = [
  { name: "Jennifer M.", location: "New York, NY", service: "Plumbing", text: "Found a plumber within 20 minutes during an emergency. Servy saved the day!", rating: 5, avatar: "JM" },
  { name: "Robert K.", location: "Los Angeles, CA", service: "Electrical", text: "Booked an electrician for a panel upgrade. Professional, on time, and great value.", rating: 5, avatar: "RK" },
  { name: "Amanda L.", location: "Chicago, IL", service: "House Cleaning", text: "My weekly cleaning team is amazing. Consistent, thorough, and so trustworthy.", rating: 5, avatar: "AL" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (!loading && user?.role === "worker") {
      router.replace("/dashboard/provider");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    fetch("/api/providers?featured=true").then((r) => r.json()).then(setFeaturedProviders).catch(() => {});
  }, []);

  if (loading) return null;
  if (user?.role === "worker") return null;

  const isCustomer = user?.role === "customer";

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {isCustomer ? (
            /* Customer hero */
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/40 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                1,200+ pros available near you right now
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Any service, <span className="text-yellow-300">any time</span>.<br />One tap away.
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl">
                Welcome back, {user.name.split(" ")[0]}! Find vetted local professionals for over 150 services, instantly bookable.
              </p>
              <SearchBar large />
              <div className="flex flex-wrap gap-3 mt-5">
                {["🔧 Plumbing", "⚡ Electrical", "🧹 Cleaning", "🌿 Landscaping", "❄️ HVAC", "🐾 Pet Care"].map((tag) => (
                  <Link key={tag} href={`/services?q=${tag.split(" ")[1]}`} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Guest hero */
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/40 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Trusted by 2 million+ homeowners
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Find trusted professionals<br />for <span className="text-yellow-300">any service</span>
              </h1>
              <p className="text-xl text-blue-100 mb-10 max-w-xl">
                From plumbing to personal wellness — 50,000+ verified pros ready to help. Instant booking, guaranteed quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register" className="bg-white hover:bg-gray-50 text-blue-700 font-bold py-4 px-8 rounded-xl transition-colors text-lg text-center">
                  Sign Up Free →
                </Link>
                <Link href="/login" className="border-2 border-white/60 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg text-center">
                  Log In
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Free to use for customers</span>
                <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Verified & background-checked pros</span>
                <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Protected payments</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-1">150+ service types available</p>
          </div>
          <Link href="/services" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/services" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
            See all 25+ categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How Servy Works</h2>
            <p className="text-gray-500 mt-2">Book a service in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-blue-100" />
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          {!isCustomer && (
            <div className="mt-10 text-center">
              <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors">
                Get Started Free →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PROVIDERS — customer only ── */}
      {isCustomer && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top-Rated Professionals</h2>
              <p className="text-gray-500 mt-1">Vetted, background-checked experts</p>
            </div>
            <Link href="/services" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
              View all pros
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Loved by Millions</h2>
            <p className="text-blue-100 mt-2">Join 2 million+ satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location} · {t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isCustomer ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to book a service?</h2>
              <p className="text-gray-500 text-lg mb-8">Find a pro for any job in your area today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/request" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg">
                  ⚡ Book a Service Now
                </Link>
                <Link href="/services" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-colors text-lg">
                  Browse All Services
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
              <p className="text-gray-500 text-lg mb-8">Join millions of people who trust Servy for every service need.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg">
                  Sign Up Free →
                </Link>
                <Link href="/register?role=worker" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-colors text-lg">
                  Join as a Pro
                </Link>
              </div>
              <p className="text-sm text-gray-400 mt-4">Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Log in</Link></p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
