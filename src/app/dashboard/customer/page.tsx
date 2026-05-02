"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";

const mockBookings = [
  { id: "b1", providerName: "Marcus Johnson", providerAvatar: "MJ", service: "Pipe Repair", date: "Apr 28, 2025", time: "10:00 AM", status: "confirmed" as const, price: 170, address: "123 Main St, New York, NY", category: "plumbing" },
  { id: "b2", providerName: "Sofia Rodriguez", providerAvatar: "SR", service: "Deep Clean", date: "Apr 25, 2025", time: "9:00 AM", status: "completed" as const, price: 165, address: "123 Main St, New York, NY", category: "cleaning" },
  { id: "b3", providerName: "Emily Chen", providerAvatar: "EC", service: "EV Charger Install", date: "Apr 22, 2025", time: "2:00 PM", status: "completed" as const, price: 285, address: "123 Main St, New York, NY", category: "electrical" },
  { id: "b4", providerName: "James Williams", providerAvatar: "JW", service: "AC Repair", date: "May 5, 2025", time: "11:00 AM", status: "pending" as const, price: 135, address: "123 Main St, New York, NY", category: "hvac" },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showReview, setShowReview] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = mockBookings.filter((b) => ["pending", "confirmed", "in-progress"].includes(b.status));
  const past = mockBookings.filter((b) => ["completed", "cancelled"].includes(b.status));
  const shown = activeTab === "upcoming" ? upcoming : past;

  const totalSpent = past.reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]}!</p>
          </div>
          <Link href="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm">
            + Book a Service
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: mockBookings.length, icon: "📋" },
            { label: "Completed", value: past.length, icon: "✅" },
            { label: "Upcoming", value: upcoming.length, icon: "📅" },
            { label: "Total Spent", value: `$${totalSpent}`, icon: "💳" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab("upcoming")} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "upcoming" ? "text-blue-600 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
              Upcoming ({upcoming.length})
            </button>
            <button onClick={() => setActiveTab("past")} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "past" ? "text-blue-600 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
              Past ({past.length})
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {shown.map((booking) => (
              <div key={booking.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {booking.providerAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{booking.providerName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>📅 {booking.date} at {booking.time}</span>
                        <span>📍 {booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">${booking.price}</p>
                    {booking.status === "completed" && (
                      <button onClick={() => setShowReview(booking.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                        Leave Review
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <button className="text-xs text-red-500 hover:text-red-600 font-medium mt-1 block">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline review form */}
                {showReview === booking.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Rate your experience with {booking.providerName}</h4>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setRating(s)}>
                          <svg className={`w-6 h-6 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Share your experience..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowReview(null)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">Submit Review</button>
                      <button onClick={() => setShowReview(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {shown.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} bookings</h3>
                <p className="text-gray-500 mb-5">Find a professional for any job you need.</p>
                <Link href="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                  Browse Services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
