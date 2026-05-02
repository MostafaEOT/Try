"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";

const mockJobs = [
  { id: "j1", customerName: "Alex Johnson", customerAvatar: "AJ", service: "Pipe Repair", date: "Apr 28, 2025", time: "10:00 AM", status: "confirmed" as const, amount: 170, address: "123 Main St, New York, NY" },
  { id: "j2", customerName: "Maria Silva", customerAvatar: "MS", service: "Leak Detection", date: "Apr 26, 2025", time: "2:00 PM", status: "pending" as const, amount: 120, address: "456 Oak Ave, New York, NY" },
  { id: "j3", customerName: "Tom Richards", customerAvatar: "TR", service: "Faucet Install", date: "Apr 22, 2025", time: "9:00 AM", status: "completed" as const, amount: 95, address: "789 Elm St, New York, NY" },
  { id: "j4", customerName: "Sarah Kim", customerAvatar: "SK", service: "Drain Cleaning", date: "Apr 19, 2025", time: "11:00 AM", status: "completed" as const, amount: 130, address: "321 Pine Rd, New York, NY" },
];

const earningsData = [
  { month: "Jan", amount: 2400 },
  { month: "Feb", amount: 3200 },
  { month: "Mar", amount: 2800 },
  { month: "Apr", amount: 3800 },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function ProviderDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "earnings" | "profile">("jobs");

  useEffect(() => {
    if (!loading && (!user || user.role !== "worker")) {
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

  const totalEarnings = mockJobs.filter((j) => j.status === "completed").reduce((sum, j) => sum + j.amount, 0);
  const thisMonthEarnings = earningsData[earningsData.length - 1].amount;
  const maxEarning = Math.max(...earningsData.map((e) => e.amount));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
              {user.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={4.9} />
                <span className="text-sm font-medium text-gray-700">4.9</span>
                <span className="text-xs text-gray-400">(312 reviews)</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                🟢 Available
              </span>
            </div>
          </div>
          <Link href="/services" className="text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-xl transition-colors text-sm">
            View Public Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Earned", value: `$${totalEarnings}`, icon: "💰", sub: "All time" },
            { label: "This Month", value: `$${thisMonthEarnings.toLocaleString()}`, icon: "📈", sub: "+19% vs last month" },
            { label: "Jobs Done", value: "1,240", icon: "✅", sub: "All time" },
            { label: "Rating", value: "4.9★", icon: "⭐", sub: "312 reviews" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-green-600 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["jobs", "earnings", "profile"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
                {tab === "jobs" ? "📋 Jobs" : tab === "earnings" ? "💰 Earnings" : "👤 Profile"}
              </button>
            ))}
          </div>

          {activeTab === "jobs" && (
            <div className="divide-y divide-gray-50">
              {mockJobs.map((job) => (
                <div key={job.id} className="p-5 space-y-3">
                  {/* Top row: customer info + amount */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                        {job.customerAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{job.service}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{job.customerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">📅 {job.date} at {job.time}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 flex-shrink-0">${job.amount}</p>
                  </div>

                  {/* Customer location — shown for pending and confirmed */}
                  {(job.status === "pending" || job.status === "confirmed") && (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-medium">Customer Location</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{job.address}</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Navigate
                      </a>
                    </div>
                  )}

                  {/* Action buttons */}
                  {job.status === "pending" && (
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        ✓ Accept Job
                      </button>
                      <button className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {job.status === "confirmed" && (
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Job — I&apos;m on my way
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Monthly Earnings</h3>
              <div className="flex items-end gap-4 h-40">
                {earningsData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs font-semibold text-gray-600">${(data.amount / 1000).toFixed(1)}k</p>
                    <div
                      className="w-full bg-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${(data.amount / maxEarning) * 120}px` }}
                    />
                    <p className="text-xs text-gray-500">{data.month}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-gray-50 pt-6 grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Available for Payout</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">$1,840</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">$170</p>
                </div>
              </div>
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Request Payout
              </button>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6 space-y-5">
              <h3 className="font-semibold text-gray-900">Profile Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: "Marcus Johnson" },
                  { label: "Phone", value: "+1 (555) 123-4567" },
                  { label: "Email", value: "marcus.j@email.com" },
                  { label: "Location", value: "New York, NY" },
                  { label: "Hourly Rate", value: "$85/hr" },
                  { label: "Response Time", value: "~15 min" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    <input type="text" defaultValue={field.value} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                <textarea rows={3} defaultValue="Licensed master plumber with 15 years of experience. Specializing in emergency repairs, leak detection, and full bathroom remodels." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
