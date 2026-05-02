"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";

interface JobRecord {
  id: string;
  customerId: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  price: number;
  address: string;
  customer: { id: string; name: string; avatar: string };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function ProviderDashboard() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "earnings" | "profile">("jobs");
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "worker")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const fetchJobs = useCallback(async () => {
    if (!user?.providerId) { setJobsLoading(false); return; }
    setJobsLoading(true);
    try {
      const data = await fetch(`/api/bookings?providerId=${user.providerId}`).then((r) => r.json());
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchJobs();
  }, [user, fetchJobs]);

  const updateJobStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    fetchJobs();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = user.isActive !== false;
  const toggleActive = async () => {
    const next = !isActive;
    updateUser({ isActive: next });
    try {
      await fetch("/api/auth/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: next }),
      });
    } catch { /* silently ignore — localStorage already updated */ }
  };

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const totalEarnings = completedJobs.reduce((sum, j) => sum + j.price, 0);

  // Group earnings by month for the chart
  const earningsByMonth: Record<string, number> = {};
  completedJobs.forEach((j) => {
    const parts = j.date.split(" ");
    const month = parts[0] ?? "?";
    earningsByMonth[month] = (earningsByMonth[month] ?? 0) + j.price;
  });
  const earningsData = Object.entries(earningsByMonth).slice(-4).map(([month, amount]) => ({ month, amount }));
  const maxEarning = earningsData.length > 0 ? Math.max(...earningsData.map((e) => e.amount)) : 1;

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const confirmedJobs = jobs.filter((j) => j.status === "confirmed");
  const pendingEarnings = pendingJobs.reduce((sum, j) => sum + j.price, 0) + confirmedJobs.reduce((sum, j) => sum + j.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Offline banner */}
        {!isActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl flex-shrink-0">⚫</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">You are offline</p>
              <p className="text-xs text-amber-600 mt-0.5">You won&apos;t receive new job requests while offline.</p>
            </div>
            <button onClick={toggleActive} className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
              Go Active
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                {user.avatar}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={completedJobs.length > 0 ? 4.9 : 0} />
                <span className="text-sm font-medium text-gray-700">{completedJobs.length > 0 ? "4.9" : "—"}</span>
                <span className="text-xs text-gray-400">({completedJobs.length} completed)</span>
              </div>
              <button
                onClick={toggleActive}
                className={`mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${isActive ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${isActive ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                {isActive ? "Active — accepting jobs" : "Offline — not accepting jobs"}
              </button>
            </div>
          </div>
          <Link href="/services" className="text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-xl transition-colors text-sm flex-shrink-0">
            View Public Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Earned", value: `$${totalEarnings}`, icon: "💰", sub: "All time" },
            { label: "Pending Pay", value: `$${pendingEarnings}`, icon: "📈", sub: "Awaiting completion" },
            { label: "Jobs Done", value: completedJobs.length, icon: "✅", sub: "All time" },
            { label: "Total Jobs", value: jobs.length, icon: "📋", sub: "All time" },
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
            jobsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
                <p className="text-gray-500">
                  {user.providerId
                    ? "Make sure you are active to start receiving job requests."
                    : "Your provider profile isn't set up yet. Try logging out and back in."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {jobs.map((job) => (
                  <div key={job.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                          {job.customer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{job.service}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{job.customer.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📅 {job.date} at {job.time}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 flex-shrink-0">${job.price}</p>
                    </div>

                    {(job.status === "pending" || job.status === "confirmed") && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
                          Navigate
                        </a>
                      </div>
                    )}

                    {job.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateJobStatus(job.id, "confirmed")} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                          ✓ Accept Job
                        </button>
                        <button onClick={() => updateJobStatus(job.id, "cancelled")} className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                          ✕ Decline
                        </button>
                      </div>
                    )}
                    {job.status === "confirmed" && (
                      <button onClick={() => updateJobStatus(job.id, "in-progress")} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Job — I&apos;m on my way
                      </button>
                    )}
                    {job.status === "in-progress" && (
                      <button onClick={() => updateJobStatus(job.id, "completed")} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        ✓ Mark as Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "earnings" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Monthly Earnings</h3>
              {earningsData.length > 0 ? (
                <div className="flex items-end gap-4 h-40">
                  {earningsData.map((data) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs font-semibold text-gray-600">${data.amount}</p>
                      <div
                        className="w-full bg-blue-600 rounded-t-lg transition-all"
                        style={{ height: `${(data.amount / maxEarning) * 120}px` }}
                      />
                      <p className="text-xs text-gray-500">{data.month}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  No earnings data yet
                </div>
              )}
              <div className="mt-6 border-t border-gray-50 pt-6 grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">${totalEarnings}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">${pendingEarnings}</p>
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
                  { label: "Full Name", value: user.name },
                  { label: "Email", value: user.email },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    <input type="text" defaultValue={field.value} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
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
