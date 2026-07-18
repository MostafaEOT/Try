"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface BookingRecord {
  id: string;
  providerId: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  price: number;
  address: string;
  notes?: string;
  reviewed: boolean;
  jobPhotos: string[];
  provider: { id: string; name: string; avatar: string; subcategory: string };
  dispute?: { id: string; status: string; reason: string } | null;
}

interface FavoriteProvider {
  id: string;
  name: string;
  avatar: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  bookingId?: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string; role: string };
}

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

type Tab = "upcoming" | "past" | "favorites" | "notifications" | "history" | "profile";

export default function CustomerDashboard() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const [showReview, setShowReview] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showDispute, setShowDispute] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  const [showChat, setShowChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) router.replace("/login");
  }, [user, loading, router]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const data = await fetch(`/api/bookings?customerId=${user.id}`).then((r) => r.json());
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const data = await fetch(`/api/favorites?userId=${user.id}`).then((r) => r.json()).catch(() => []);
    setFavorites(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const data = await fetch(`/api/notifications?userId=${user.id}`).then((r) => r.json()).catch(() => []);
    setNotifications(Array.isArray(data) ? data : []);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchFavorites();
      fetchNotifications();
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user, fetchBookings, fetchFavorites, fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [user, fetchNotifications]);

  const fetchMessages = useCallback(async (bookingId: string) => {
    const data = await fetch(`/api/messages?bookingId=${bookingId}`).then((r) => r.json()).catch(() => []);
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    if (!showChat) return;
    fetchMessages(showChat);
    const id = setInterval(() => fetchMessages(showChat), 5000);
    return () => clearInterval(id);
  }, [showChat, fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cancelBooking = async (id: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    }).catch(() => {});
    fetchBookings();
  };

  const submitReview = async (booking: BookingRecord) => {
    if (!user || !reviewComment.trim()) return;
    setSubmittingReview(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: booking.providerId,
        customerId: user.id,
        author: user.name,
        avatar: user.avatar,
        rating,
        comment: reviewComment,
        service: booking.service,
        bookingId: booking.id,
      }),
    }).catch(() => {});
    setSubmittingReview(false);
    setShowReview(null);
    setReviewComment("");
    setRating(5);
    fetchBookings();
  };

  const submitDispute = async (bookingId: string) => {
    if (!user || !disputeReason || !disputeDesc.trim()) return;
    await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, customerId: user.id, reason: disputeReason, description: disputeDesc }),
    }).catch(() => {});
    setShowDispute(null);
    setDisputeReason("");
    setDisputeDesc("");
    fetchBookings();
  };

  const sendMessage = async () => {
    if (!user || !showChat || !newMessage.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: showChat, senderId: user.id, content: newMessage }),
    }).catch(() => {});
    setNewMessage("");
    fetchMessages(showChat);
  };

  const removeFavorite = async (providerId: string) => {
    if (!user) return;
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, providerId }),
    }).catch(() => {});
    fetchFavorites();
  };

  const markAllRead = async () => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    }).catch(() => {});
    fetchNotifications();
  };

  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    const updated = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName, email: profileEmail }),
    }).then((r) => r.json()).catch(() => null);
    setProfileSaving(false);
    if (updated && !updated.error) {
      updateUser({ name: updated.name, email: updated.email });
      setProfileMsg("Profile updated!");
      setTimeout(() => setProfileMsg(""), 3000);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = bookings.filter((b) => ["pending", "confirmed", "in-progress"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));
  const completed = past.filter((b) => b.status === "completed");
  const totalSpent = completed.reduce((s, b) => s + b.price, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const shownBookings = activeTab === "upcoming" ? upcoming : past;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "upcoming", label: "Upcoming", badge: upcoming.length || undefined },
    { key: "past", label: "Past" },
    { key: "favorites", label: "Saved" },
    { key: "notifications", label: "Alerts", badge: unreadCount || undefined },
    { key: "history", label: "Payments" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]}!</p>
          </div>
          <Link href="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm">
            + Book a Service
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, icon: "📋" },
            { label: "Completed", value: completed.length, icon: "✅" },
            { label: "Upcoming", value: upcoming.length, icon: "📅" },
            { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: "💳" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === t.key ? "text-blue-600 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {t.badge ? (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.badge}</span>
                ) : null}
              </button>
            ))}
          </div>

          {(activeTab === "upcoming" || activeTab === "past") && (
            bookingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {shownBookings.map((booking) => (
                  <div key={booking.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {booking.provider.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[booking.status]}`}>
                              {statusLabels[booking.status]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{booking.provider.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>📅 {booking.date} at {booking.time}</span>
                            <span>📍 {booking.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="font-bold text-gray-900">${booking.price}</p>
                        <button
                          onClick={() => { setShowChat(showChat === booking.id ? null : booking.id); setMessages([]); }}
                          className="block text-xs text-blue-500 hover:text-blue-700 font-medium"
                        >
                          💬 Chat
                        </button>
                        {booking.status === "completed" && !booking.reviewed && (
                          <button onClick={() => setShowReview(booking.id)} className="block text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                            ⭐ Review
                          </button>
                        )}
                        {booking.status === "completed" && !booking.dispute && (
                          <button onClick={() => setShowDispute(booking.id)} className="block text-xs text-red-500 hover:text-red-600 font-medium">
                            🚩 Dispute
                          </button>
                        )}
                        {booking.status === "completed" && (
                          <Link href={`/book/${booking.providerId}`} className="block text-xs text-green-600 hover:text-green-700 font-medium">
                            🔄 Rebook
                          </Link>
                        )}
                        {(booking.status === "confirmed" || booking.status === "pending") && (
                          <button onClick={() => cancelBooking(booking.id)} className="block text-xs text-red-500 hover:text-red-600 font-medium">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {booking.dispute && (
                      <div className="mt-3 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700 font-medium">
                        🚩 Dispute ({booking.dispute.status}): {booking.dispute.reason}
                      </div>
                    )}

                    {showReview === booking.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Rate your experience with {booking.provider.name}</h4>
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setRating(s)}>
                              <svg className={`w-6 h-6 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReview(booking)}
                            disabled={submittingReview || !reviewComment.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors"
                          >
                            {submittingReview ? "Submitting..." : "Submit Review"}
                          </button>
                          <button onClick={() => setShowReview(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {showDispute === booking.id && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">File a Dispute</h4>
                        <select
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <option value="">Select a reason...</option>
                          <option>Work not completed</option>
                          <option>Poor quality</option>
                          <option>No show</option>
                          <option>Overcharged</option>
                          <option>Other</option>
                        </select>
                        <textarea
                          value={disputeDesc}
                          onChange={(e) => setDisputeDesc(e.target.value)}
                          placeholder="Describe the issue..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitDispute(booking.id)}
                            disabled={!disputeReason || !disputeDesc.trim()}
                            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg"
                          >
                            Submit Dispute
                          </button>
                          <button onClick={() => setShowDispute(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {showChat === booking.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">Chat with {booking.provider.name}</h4>
                          <button onClick={() => setShowChat(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                        </div>
                        <div className="h-48 overflow-y-auto space-y-2 mb-3">
                          {messages.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No messages yet. Say hello!</p>
                          )}
                          {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.senderId === user.id ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {shownBookings.length === 0 && (
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
            )
          )}

          {activeTab === "favorites" && (
            <div className="p-5">
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🤍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved providers</h3>
                  <p className="text-gray-500 mb-5">Tap the heart on any provider profile to save them here.</p>
                  <Link href="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.subcategory} · ${p.hourlyRate}/hr</p>
                        <p className="text-xs text-yellow-600">★ {p.rating} ({p.reviewCount})</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/book/${p.id}`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium">
                          Book
                        </Link>
                        <button onClick={() => removeFavorite(p.id)} className="text-xs text-red-500 hover:text-red-600 px-2 py-1.5 font-medium">
                          ♥
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-5">
              {notifications.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Mark all as read
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔔</div>
                  <p className="text-gray-500">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? "bg-white border border-gray-100" : "bg-blue-50 border border-blue-100"}`}>
                      <span className="text-lg mt-0.5">
                        {n.type.includes("message") ? "💬" : n.type.includes("completed") ? "✅" : n.type.includes("review") ? "⭐" : "📋"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900">${totalSpent}</span></p>
              </div>
              {completed.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">💳</div>
                  <p className="text-gray-500">No completed payments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completed.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{b.service}</p>
                        <p className="text-xs text-gray-500">{b.provider.name} · {b.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${b.price.toFixed(2)}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-5 max-w-md">
              <h3 className="font-semibold text-gray-900 mb-5">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
                {profileMsg && <p className="text-sm text-green-600 text-center">{profileMsg}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
