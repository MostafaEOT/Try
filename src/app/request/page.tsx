"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { providers } from "@/data/providers";
import StarRating from "@/components/StarRating";
import { Provider } from "@/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getNextDays(count: number) {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d);
  }
  return days;
}

const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

type BookingMode = "instant" | "scheduled";
type Step = 1 | 2 | 3 | 4 | 5;

export default function RequestPage() {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<BookingMode>("instant");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [nearbyProviders, setNearbyProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const selectedCategory = categories.find((c) => c.id === category);

  // Simulate dispatch animation
  useEffect(() => {
    if (step === 4 && mode === "instant") {
      setDispatching(true);
      setDispatchStep(0);
      const timers = [
        setTimeout(() => setDispatchStep(1), 800),
        setTimeout(() => setDispatchStep(2), 2000),
        setTimeout(() => setDispatchStep(3), 3500),
        setTimeout(() => {
          setDispatching(false);
          const online = providers.filter((p) => p.online).slice(0, 4);
          setNearbyProviders(online);
        }, 4500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [step, mode]);

  const handleStep1 = () => {
    if (category && address) setStep(2);
  };

  const handleStep2 = () => {
    if (mode === "scheduled" && (!selectedDate || !selectedTime)) return;
    setStep(3);
  };

  const handleSubmit = () => {
    if (mode === "instant") {
      setStep(4);
    } else {
      // For scheduled, show provider list directly
      const available = providers.filter((p) => p.categoryId === category || !category).slice(0, 4);
      setNearbyProviders(available);
      setStep(4);
    }
  };

  const handleChooseProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setStep(5);
    setTimeout(() => setConfirmed(true), 1500);
  };

  const handleAutoAssign = () => {
    const best = nearbyProviders.sort((a, b) => a.distanceKm - b.distanceKm)[0];
    handleChooseProvider(best);
  };

  if (confirmed && selectedProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "instant" ? "Pro is on the way!" : "Booking Confirmed!"}
          </h1>
          <p className="text-gray-500 mb-6">
            {mode === "instant"
              ? `${selectedProvider.name} has accepted your request and will arrive in approximately ${Math.round(selectedProvider.distanceKm * 5)} minutes.`
              : `Your appointment with ${selectedProvider.name} is confirmed for ${selectedDate ? `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}` : ""} at ${selectedTime}.`}
          </p>

          {/* Provider info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                {selectedProvider.avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedProvider.name}</p>
                <p className="text-sm text-gray-500">{selectedProvider.subcategory}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Rating</span><p className="font-semibold">{selectedProvider.rating}★</p></div>
              <div><span className="text-gray-500">Rate</span><p className="font-semibold">${selectedProvider.hourlyRate}/hr</p></div>
              {mode === "instant" && <div><span className="text-gray-500">Distance</span><p className="font-semibold">{selectedProvider.distanceKm} km away</p></div>}
              <div><span className="text-gray-500">Phone</span><p className="font-semibold text-blue-600">Call Pro</p></div>
            </div>
          </div>

          {mode === "instant" && (
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Estimated arrival</span>
                <span className="font-bold text-blue-600">{Math.round(selectedProvider.distanceKm * 5)} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "30%" }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Pro is heading your way...</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {mode === "instant" && (
              <Link
                href={`/tracking/booking-001?providerId=${selectedProvider.id}&address=${encodeURIComponent(address)}&eta=${Math.round(selectedProvider.distanceKm * 5)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Track Your Pro Live
              </Link>
            )}
            <Link href="/dashboard/customer" className={`font-semibold py-3 rounded-xl transition-colors text-center ${mode === "instant" ? "border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
              {mode === "instant" ? "View My Bookings" : "Go to My Bookings"}
            </Link>
            <Link href="/" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {mode === "instant" ? "Notifying your pro..." : "Confirming your booking..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Request a Service</h1>
          <p className="text-gray-500 mt-1">Tell us what you need — we&apos;ll find the best pro near you</p>
        </div>

        {/* Progress bar */}
        {step <= 3 && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > s ? "✓" : s}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${step >= s ? "text-blue-600" : "text-gray-400"}`}>
                    {s === 1 ? "What & Where" : s === 2 ? "When" : "Review"}
                  </p>
                </div>
                {s < 3 && <div className={`h-0.5 w-4 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — What & Where */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">What do you need?</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setSubcategory(""); }}
                    className={`p-3 rounded-xl text-left transition-all border ${category === cat.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50 hover:border-blue-300"}`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <p className="text-xs font-medium text-gray-800 mt-1">{cat.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Service</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${subcategory === sub ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe the job</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. My kitchen sink is leaking under the cabinet. Need urgent repair."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleStep1}
              disabled={!category || !address}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 — When */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">When do you need it?</h2>

            {/* Instant vs Scheduled toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("instant")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "instant" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-semibold text-gray-900 text-sm">Now</p>
                <p className="text-xs text-gray-500 mt-0.5">Find an available pro nearby right now</p>
              </button>
              <button
                onClick={() => setMode("scheduled")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "scheduled" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                <div className="text-2xl mb-2">📅</div>
                <p className="font-semibold text-gray-900 text-sm">Schedule</p>
                <p className="text-xs text-gray-500 mt-0.5">Pick a date and time that suits you</p>
              </button>
            </div>

            {mode === "scheduled" && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Date</p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {getNextDays(14).map((day) => (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 rounded-xl text-center transition-colors ${selectedDate?.toDateString() === day.toDateString() ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-blue-50 text-gray-700"}`}
                      >
                        <p className="text-xs font-medium">{DAY_NAMES[day.getDay()]}</p>
                        <p className="text-base font-bold">{day.getDate()}</p>
                        <p className="text-xs">{MONTH_NAMES[day.getMonth()]}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Time</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedTime === t ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-blue-50 text-gray-700"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors">
                Back
              </button>
              <button
                onClick={handleStep2}
                disabled={mode === "scheduled" && (!selectedDate || !selectedTime)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Review your request</h2>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                { label: "Service", value: `${selectedCategory?.icon} ${selectedCategory?.name}${subcategory ? ` — ${subcategory}` : ""}` },
                { label: "Address", value: address },
                { label: "When", value: mode === "instant" ? "⚡ Now — Find nearest available pro" : `📅 ${selectedDate ? `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}` : ""} at ${selectedTime}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm gap-4">
                  <span className="text-gray-500 flex-shrink-0">{item.label}</span>
                  <span className="font-medium text-gray-900 text-right">{item.value}</span>
                </div>
              ))}
              {description && (
                <div className="pt-2 border-t border-gray-200 text-sm">
                  <p className="text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{description}</p>
                </div>
              )}
            </div>

            {mode === "instant" ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
                <span className="text-xl">📡</span>
                <div>
                  <p className="font-semibold mb-1">How instant booking works</p>
                  <p className="text-blue-600 leading-relaxed">
                    Your request is sent to all available verified pros near you. The first to accept gets the job, or you can hand-pick from the list of pros who respond.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="font-semibold mb-1">How scheduled booking works</p>
                  <p className="text-blue-600 leading-relaxed">
                    We&apos;ll show you available pros for your chosen time. You can auto-assign the best match or pick a specific pro you prefer.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors">
                Back
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                {mode === "instant" ? "⚡ Find Pros Now" : "📅 Find Available Pros"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Dispatch / Choose Pro */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Dispatching animation */}
            {dispatching && mode === "instant" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping" />
                  <div className="absolute inset-2 border-4 border-blue-200 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute inset-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">📡</div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Finding pros near you...</h2>
                <div className="space-y-2 text-sm text-left max-w-xs mx-auto">
                  {[
                    { label: "Locating nearby professionals", done: dispatchStep >= 1 },
                    { label: "Checking availability & ratings", done: dispatchStep >= 2 },
                    { label: "Notifying 4 pros in your area", done: dispatchStep >= 3 },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 transition-colors ${item.done ? "text-green-600" : "text-gray-400"}`}>
                      {item.done ? (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider list */}
            {!dispatching && nearbyProviders.length > 0 && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h2 className="font-bold text-gray-900">
                      {mode === "instant" ? `${nearbyProviders.length} pros responded!` : `${nearbyProviders.length} pros available for your time`}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    {mode === "instant"
                      ? "Choose a pro or let us pick the closest one for you."
                      : `Showing pros available on ${selectedDate ? `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}` : ""} at ${selectedTime}.`}
                  </p>
                </div>

                {/* Auto-assign button */}
                <button
                  onClick={handleAutoAssign}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">⚡</span>
                  Auto-assign the {mode === "instant" ? "closest" : "best"} available pro
                </button>

                <div className="text-center text-sm text-gray-400">— or choose yourself —</div>

                {/* Individual provider cards */}
                <div className="space-y-3">
                  {nearbyProviders.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                            {p.avatar}
                          </div>
                          {p.online && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{p.name}</h3>
                            {p.verified && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{p.subcategory}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1">
                              <StarRating rating={p.rating} />
                              <span className="text-xs font-medium text-gray-700">{p.rating}</span>
                            </div>
                            <span className="text-xs text-gray-400">{p.completedJobs} jobs</span>
                            {mode === "instant" && (
                              <span className="text-xs text-blue-600 font-medium">📍 {p.distanceKm} km away</span>
                            )}
                            <span className="text-xs text-green-600 font-medium">✓ {p.acceptanceRate}% acceptance</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">${p.hourlyRate}<span className="text-xs font-normal text-gray-400">/hr</span></p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.responseTime}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/provider/${p.id}`} className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-lg transition-colors text-sm">
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleChooseProvider(p)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                        >
                          {mode === "instant" ? "Choose & Confirm" : "Book This Pro"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
