"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface BookingRecord {
  id: string;
  customerId: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  price: number;
  materialsTotal: number;
  address: string;
  notes?: string;
  jobPhotos: string[];
  reviewed: boolean;
  customer: { id: string; name: string; avatar: string };
  dispute?: { id: string; status: string; reason: string } | null;
}

interface ShopRecord {
  id: string;
  name: string;
  avatar: string;
  description: string;
  location: string;
  online: boolean;
  products: { id: string }[];
}

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  shop: { id: string; name: string };
}

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

interface MaterialRequestRecord {
  id: string;
  bookingId: string;
  status: string;
  totalCost: number;
  notes: string;
  createdAt: string;
  shop: { id: string; name: string };
  booking: { id: string; service: string };
  items: Array<{ quantity: number; unitPrice: number; product: { name: string; unit: string } }>;
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string; role: string };
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  bankAccount: string;
  createdAt: string;
}

interface ProviderProfile {
  id: string;
  name: string;
  bio: string;
  hourlyRate: number;
  location: string;
  availability: string[];
  online: boolean;
  responseTime: string;
  subcategory: string;
  bankAccount?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Tab = "requests" | "active" | "calendar" | "earnings" | "ratings" | "profile" | "payout" | "materials";

export default function ProviderDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  const [showChat, setShowChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showPhotos, setShowPhotos] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [editBio, setEditBio] = useState("");
  const [editRate, setEditRate] = useState(0);
  const [editLocation, setEditLocation] = useState("");
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editResponse, setEditResponse] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutBank, setPayoutBank] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState("");

  const [shops, setShops] = useState<ShopRecord[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopProducts, setShopProducts] = useState<ProductRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [materialBookingId, setMaterialBookingId] = useState("");
  const [materialNotes, setMaterialNotes] = useState("");
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const [materialMsg, setMaterialMsg] = useState("");
  const [myMaterialRequests, setMyMaterialRequests] = useState<MaterialRequestRecord[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "worker")) router.replace("/login");
  }, [user, loading, router]);

  const fetchBookings = useCallback(async () => {
    if (!user?.providerId) return;
    setBookingsLoading(true);
    try {
      const data = await fetch(`/api/bookings?providerId=${user.providerId}`).then((r) => r.json());
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user?.providerId) return;
    const data = await fetch(`/api/providers/${user.providerId}`).then((r) => r.json()).catch(() => null);
    if (data && !data.error) {
      setProfile(data);
      setEditBio(data.bio);
      setEditRate(data.hourlyRate);
      setEditLocation(data.location);
      setEditDays(data.availability);
      setEditResponse(data.responseTime);
      setPayoutBank(data.bankAccount || "");
    }
  }, [user]);

  const fetchReviews = useCallback(async () => {
    if (!user?.providerId) return;
    const data = await fetch(`/api/providers/${user.providerId}`).then((r) => r.json()).catch(() => null);
    if (data?.reviews) setReviews(data.reviews);
  }, [user]);

  const fetchPayouts = useCallback(async () => {
    if (!user?.providerId) return;
    const data = await fetch(`/api/payouts?providerId=${user.providerId}`).then((r) => r.json()).catch(() => []);
    setPayouts(Array.isArray(data) ? data : []);
  }, [user]);

  useEffect(() => {
    if (user?.providerId) {
      fetchBookings();
      fetchProfile();
      fetchReviews();
      fetchPayouts();
    }
  }, [user, fetchBookings, fetchProfile, fetchReviews, fetchPayouts]);

  useEffect(() => {
    if (activeTab === "materials") {
      fetchShops();
      fetchMyMaterialRequests();
    }
  }, [activeTab, fetchShops, fetchMyMaterialRequests]);

  useEffect(() => {
    if (selectedShopId) fetchShopProducts(selectedShopId);
  }, [selectedShopId, fetchShopProducts]);

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

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    fetchBookings();
  };

  const toggleOnline = async () => {
    if (!user?.providerId || !profile) return;
    const next = !profile.online;
    await fetch(`/api/providers/${user.providerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ online: next }),
    }).catch(() => {});
    setProfile({ ...profile, online: next });
  };

  const saveProfile = async () => {
    if (!user?.providerId) return;
    setProfileSaving(true);
    await fetch(`/api/providers/${user.providerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: editBio, hourlyRate: editRate, location: editLocation, availability: editDays, responseTime: editResponse }),
    }).catch(() => {});
    setProfileSaving(false);
    setProfileMsg("Profile updated!");
    setTimeout(() => setProfileMsg(""), 3000);
    fetchProfile();
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

  const addJobPhoto = async (bookingId: string, existingPhotos: string[]) => {
    if (!photoUrl.trim()) return;
    const updated = [...existingPhotos, photoUrl.trim()];
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPhotos: updated }),
    }).catch(() => {});
    setPhotoUrl("");
    fetchBookings();
  };

  const fetchShops = useCallback(async () => {
    const data = await fetch("/api/shops").then((r) => r.json()).catch(() => []);
    setShops(Array.isArray(data) ? data : []);
  }, []);

  const fetchShopProducts = useCallback(async (shopId: string) => {
    const data = await fetch(`/api/products?shopId=${shopId}`).then((r) => r.json()).catch(() => []);
    setShopProducts(Array.isArray(data) ? data : []);
  }, []);

  const fetchMyMaterialRequests = useCallback(async () => {
    if (!user) return;
    const data = await fetch(`/api/material-requests?workerId=${user.id}`).then((r) => r.json()).catch(() => []);
    setMyMaterialRequests(Array.isArray(data) ? data : []);
  }, [user]);

  const addToCart = (product: ProductRecord) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) return prev.map((c) => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { productId: product.id, name: product.name, unitPrice: product.price, quantity: 1, unit: product.unit }];
    });
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((c) => c.productId !== productId));

  const submitMaterialRequest = async () => {
    if (!user || !materialBookingId || cart.length === 0 || !selectedShopId) return;
    setSubmittingMaterial(true);
    await fetch("/api/material-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: materialBookingId,
        workerId: user.id,
        shopId: selectedShopId,
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        notes: materialNotes,
      }),
    }).catch(() => {});
    setSubmittingMaterial(false);
    setMaterialMsg("Request sent to customer for approval!");
    setCart([]);
    setMaterialBookingId("");
    setMaterialNotes("");
    setSelectedShopId(null);
    setShopProducts([]);
    setTimeout(() => setMaterialMsg(""), 5000);
    fetchMyMaterialRequests();
  };

  const requestPayout = async () => {
    if (!user?.providerId || !payoutAmount || !payoutBank.trim()) return;
    setPayoutSubmitting(true);
    await fetch("/api/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId: user.providerId, amount: parseFloat(payoutAmount), bankAccount: payoutBank }),
    }).catch(() => {});
    setPayoutSubmitting(false);
    setPayoutMsg("Payout request submitted!");
    setPayoutAmount("");
    setTimeout(() => setPayoutMsg(""), 4000);
    fetchPayouts();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user.providerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Provider profile not linked</h2>
          <p className="text-gray-500">Your account is not connected to a provider profile. Please contact support.</p>
        </div>
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) => ["confirmed", "in-progress"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completed.reduce((s, b) => s + b.price, 0);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "–";

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "requests", label: "Requests", badge: pending.length || undefined },
    { key: "active", label: "Active" },
    { key: "calendar", label: "Calendar" },
    { key: "earnings", label: "Earnings" },
    { key: "ratings", label: "Ratings" },
    { key: "profile", label: "Profile" },
    { key: "payout", label: "Payout" },
    { key: "materials", label: "Materials" },
  ];

  const calendarBookings = bookings.filter((b) => b.status !== "cancelled");
  const byDate: Record<string, BookingRecord[]> = {};
  for (const b of calendarBookings) {
    if (!byDate[b.date]) byDate[b.date] = [];
    byDate[b.date].push(b);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]}!</p>
          </div>
          {profile && (
            <button
              onClick={toggleOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                profile.online ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${profile.online ? "bg-green-500" : "bg-gray-400"}`} />
              {profile.online ? "Online" : "Offline"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", value: pending.length, icon: "⏳" },
            { label: "Completed", value: completed.length, icon: "✅" },
            { label: "Total Earned", value: `$${totalEarnings.toFixed(2)}`, icon: "💰" },
            { label: "Avg Rating", value: avgRating, icon: "⭐" },
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
                  <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.badge}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Requests */}
          {activeTab === "requests" && (
            bookingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pending.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-500">No pending requests.</p>
                  </div>
                )}
                {pending.map((b) => (
                  <div key={b.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {b.customer.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{b.service}</h3>
                          <p className="text-sm text-gray-500">{b.customer.name}</p>
                          <div className="text-xs text-gray-400 mt-1">📅 {b.date} at {b.time} · 📍 {b.address}</div>
                          {b.notes && <p className="text-xs text-gray-500 mt-1 italic">&quot;{b.notes}&quot;</p>}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-gray-900 mb-2">${b.price}</p>
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(b.id, "confirmed")} className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                            Accept
                          </button>
                          <button onClick={() => updateStatus(b.id, "cancelled")} className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Active jobs */}
          {activeTab === "active" && (
            <div className="divide-y divide-gray-50">
              {active.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔨</div>
                  <p className="text-gray-500">No active jobs right now.</p>
                </div>
              )}
              {active.map((b) => (
                <div key={b.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {b.customer.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{b.service}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">{b.customer.name}</p>
                        <div className="text-xs text-gray-400 mt-1">📅 {b.date} at {b.time}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <p className="font-bold text-gray-900">${b.price}</p>
                      {b.status === "confirmed" && (
                        <button onClick={() => updateStatus(b.id, "in-progress")} className="block w-full text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium">
                          Start Job
                        </button>
                      )}
                      {b.status === "in-progress" && (
                        <button onClick={() => updateStatus(b.id, "completed")} className="block w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium">
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => { setShowChat(showChat === b.id ? null : b.id); setMessages([]); }}
                        className="block w-full text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        💬 Chat
                      </button>
                      <button
                        onClick={() => setShowPhotos(showPhotos === b.id ? null : b.id)}
                        className="block w-full text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        📷 Photos ({b.jobPhotos.length})
                      </button>
                    </div>
                  </div>

                  {showPhotos === b.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">Job Photos</h4>
                        <button onClick={() => setShowPhotos(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                      </div>
                      {b.jobPhotos.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {b.jobPhotos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Job"
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addJobPhoto(b.id, b.jobPhotos)}
                          disabled={!photoUrl.trim()}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {showChat === b.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Chat with {b.customer.name}</h4>
                        <button onClick={() => setShowChat(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                      </div>
                      <div className="h-48 overflow-y-auto space-y-2 mb-3">
                        {messages.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-4">No messages yet.</p>
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
            </div>
          )}

          {/* Calendar */}
          {activeTab === "calendar" && (
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Calendar</h3>
              {Object.keys(byDate).length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="text-gray-500">No scheduled bookings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(byDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, items]) => (
                      <div key={date} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-blue-50 px-4 py-2 font-semibold text-blue-700 text-sm">{date}</div>
                        <div className="divide-y divide-gray-50">
                          {items.map((b) => (
                            <div key={b.id} className="flex items-center justify-between px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{b.service}</p>
                                <p className="text-xs text-gray-500">{b.time} · {b.customer.name}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>
                                {b.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Earnings */}
          {activeTab === "earnings" && (
            <div className="p-5">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Earned", value: `$${totalEarnings}` },
                  { label: "Jobs Done", value: completed.length },
                  { label: "Avg per Job", value: completed.length ? `$${(totalEarnings / completed.length).toFixed(2)}` : "–" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Completed Jobs</h3>
              {completed.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No completed jobs yet.</p>
              ) : (
                <div className="space-y-2">
                  {completed.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{b.service}</p>
                        <p className="text-xs text-gray-500">{b.customer.name} · {b.date}</p>
                      </div>
                      <p className="font-bold text-green-700">${b.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ratings */}
          {activeTab === "ratings" && (
            <div className="p-5">
              <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{avgRating}</p>
                  <p className="text-xs text-gray-500">avg rating</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = reviews.filter((r) => r.rating === s).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 w-3">{s}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-5">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {r.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.author}</p>
                          <p className="text-xs text-gray-400">{r.service} · {r.date}</p>
                        </div>
                        <div className="ml-auto flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile editor */}
          {activeTab === "profile" && (
            <div className="p-5 max-w-lg">
              <h3 className="font-semibold text-gray-900 mb-5">Edit Provider Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={editRate}
                    onChange={(e) => setEditRate(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_OPTIONS.map((day) => (
                      <button
                        key={day}
                        onClick={() =>
                          setEditDays(editDays.includes(day) ? editDays.filter((d) => d !== day) : [...editDays, day])
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          editDays.includes(day) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <select
                    value={editResponse}
                    onChange={(e) => setEditResponse(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="~5 min">~5 min</option>
                    <option value="~15 min">~15 min</option>
                    <option value="~30 min">~30 min</option>
                    <option value="~1 hour">~1 hour</option>
                    <option value="~2 hours">~2 hours</option>
                  </select>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
                {profileMsg && <p className="text-sm text-green-600 text-center">{profileMsg}</p>}
              </div>
            </div>
          )}

          {/* Payout */}
          {activeTab === "payout" && (
            <div className="p-5 max-w-lg">
              <h3 className="font-semibold text-gray-900 mb-5">Earnings Payout</h3>
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">Available to withdraw</p>
                <p className="text-3xl font-bold text-green-700">${totalEarnings.toFixed(2)}</p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account / IBAN</label>
                  <input
                    value={payoutBank}
                    onChange={(e) => setPayoutBank(e.target.value)}
                    placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw ($)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={totalEarnings}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={requestPayout}
                  disabled={payoutSubmitting || !payoutAmount || !payoutBank.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {payoutSubmitting ? "Submitting..." : "Request Payout"}
                </button>
                {payoutMsg && <p className="text-sm text-green-600 text-center">{payoutMsg}</p>}
              </div>
              {payouts.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-900 mb-3">Payout History</h4>
                  <div className="space-y-2">
                    {payouts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">${p.amount}</p>
                          <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "paid" ? "bg-green-100 text-green-700" :
                          p.status === "processing" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Materials */}
          {activeTab === "materials" && (
            <div className="p-5">
              {materialMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium">
                  {materialMsg}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: shop + product browser */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Browse Shops</h3>
                  {shops.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-5xl mb-2">🏪</p>
                      <p className="text-gray-500 text-sm">No shops registered yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {shops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => setSelectedShopId(selectedShopId === shop.id ? null : shop.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            selectedShopId === shop.id ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{shop.name}</p>
                              {shop.location && <p className="text-xs text-gray-400">{shop.location}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{shop.products.length} items</span>
                              <span className={`w-2 h-2 rounded-full ${shop.online ? "bg-green-500" : "bg-gray-300"}`} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedShopId && shopProducts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Products</h4>
                      <div className="space-y-2">
                        {shopProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.description && <p className="text-xs text-gray-400">{product.description}</p>}
                              <p className="text-xs text-blue-600 font-medium mt-0.5">${product.price.toFixed(2)}/{product.unit}</p>
                            </div>
                            <button
                              onClick={() => addToCart(product)}
                              disabled={!product.inStock}
                              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-3 py-1.5 rounded-lg"
                            >
                              {product.inStock ? "Add" : "Out of Stock"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: cart + submit */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Purchase Request</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-5xl mb-2">🛒</p>
                      <p className="text-gray-500 text-sm">Select products from a shop to add them here.</p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                      <div className="space-y-2 mb-3">
                        {cart.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)}/{item.unit} × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                              <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-orange-200 pt-2 flex justify-between">
                        <span className="text-sm font-semibold text-gray-700">Total</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach to Booking *</label>
                        <select
                          value={materialBookingId}
                          onChange={(e) => setMaterialBookingId(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select an active job...</option>
                          {bookings
                            .filter((b) => b.status === "in-progress")
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.service} – {b.customer.name} ({b.date})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <input
                          value={materialNotes}
                          onChange={(e) => setMaterialNotes(e.target.value)}
                          placeholder="Why you need these materials..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={submitMaterialRequest}
                        disabled={submittingMaterial || !materialBookingId}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        {submittingMaterial ? "Sending..." : "Send to Customer for Approval"}
                      </button>
                    </div>
                  )}

                  {myMaterialRequests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">My Requests</h4>
                      <div className="space-y-2">
                        {myMaterialRequests.map((req) => (
                          <div key={req.id} className="p-3 border border-gray-100 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900">{req.shop.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                req.status === "approved" ? "bg-blue-100 text-blue-700" :
                                req.status === "rejected" ? "bg-red-100 text-red-700" :
                                req.status === "delivered" ? "bg-green-100 text-green-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {req.status === "pending_approval" ? "Awaiting" :
                                 req.status === "approved" ? "Approved" :
                                 req.status === "rejected" ? "Rejected" : "Delivered"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{req.booking.service} · ${req.totalCost.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
