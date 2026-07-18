import Link from "next/link";
import StarRating from "@/components/StarRating";
import FavoriteButton from "@/components/FavoriteButton";
import { providers as staticProviders } from "@/data/providers";
import { categories } from "@/data/categories";
import { prisma } from "@/lib/prisma";

export function generateStaticParams() {
  return staticProviders.map((p) => ({ id: p.id }));
}

export const dynamic = "force-dynamic";

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let provider = null;
  try {
    provider = await prisma.provider.findUnique({ where: { id }, include: { reviews: true } });
  } catch {
    const { getProviderById } = await import("@/data/providers");
    provider = getProviderById(id) ?? null;
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Provider not found</h1>
          <Link href="/services" className="text-blue-600 hover:underline">Browse all services</Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === provider.categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-blue-600">Services</Link>
          {category && <><span>/</span><Link href={`/services/${category.id}`} className="hover:text-blue-600">{category.name}</Link></>}
          <span>/</span>
          <span className="text-gray-800 font-medium">{provider.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {provider.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                    {provider.verified && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-0.5">{provider.subcategory} · {category?.name}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={provider.rating} size="md" />
                      <span className="font-semibold text-gray-800">{provider.rating}</span>
                      <span className="text-gray-400 text-sm">({provider.reviewCount} reviews)</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">{provider.completedJobs.toLocaleString()} jobs done</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {provider.badges.map((badge) => (
                      <span key={badge} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Experience", value: `${provider.experience} yrs` },
                { label: "Jobs Done", value: provider.completedJobs.toLocaleString() },
                { label: "Response Time", value: provider.responseTime },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="text-xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-3">About {provider.name}</h2>
              <p className="text-gray-600 leading-relaxed">{provider.bio}</p>

              <div className="mt-4 pt-4 border-t border-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
                <div className="flex gap-2 flex-wrap">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className={`text-xs font-medium px-2.5 py-1 rounded-full ${provider.availability.includes(day) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400 line-through"}`}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {provider.location}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Reviews ({provider.reviewCount})</h2>
              <div className="space-y-5">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.author}</p>
                          <p className="text-xs text-gray-400">{review.service} · {review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
                {provider.reviewCount > provider.reviews.length && (
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all {provider.reviewCount} reviews →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-3xl font-bold text-gray-900">${provider.hourlyRate}<span className="text-lg font-normal text-gray-400">/hr</span></p>
                <p className="text-xs text-gray-400 mt-1">Pricing may vary by job</p>
              </div>

              <Link href={`/book/${provider.id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors text-lg mb-3">
                  Book Now
                </button>
              </Link>
              <div className="flex gap-2 mb-3">
                <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors">
                  Message
                </button>
                <FavoriteButton providerId={provider.id} />
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Free cancellation up to 24hrs
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Secure payment protection
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Satisfaction guarantee
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Responds {provider.responseTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
