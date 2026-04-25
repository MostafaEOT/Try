"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { getProviderById } from "@/data/providers";
import StarRating from "@/components/StarRating";

const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

function getNextDays(count: number) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BookPage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = React.use(params);
  const provider = getProviderById(providerId);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [service, setService] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Provider not found</h1>
          <Link href="/services" className="text-blue-600 hover:underline">Browse services</Link>
        </div>
      </div>
    );
  }

  const days = getNextDays(14);
  const availableDays = days.filter((d) => provider.availability.includes(DAY_NAMES[d.getDay()]));

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !address || !service) return;
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Your appointment with <strong>{provider.name}</strong> is set for{" "}
            <strong>{selectedDate && `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`}</strong> at <strong>{selectedTime}</strong>.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{service}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium">{address}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Estimated Rate</span><span className="font-medium">${provider.hourlyRate}/hr</span></div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/customer" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
              View My Bookings
            </Link>
            <Link href="/" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/provider/${provider.id}`} className="hover:text-blue-600">{provider.name}</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Book</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Book {provider.name}</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? "✓" : s}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s ? "text-blue-600" : "text-gray-400"}`}>
                {s === 1 ? "Date & Time" : s === 2 ? "Details" : "Confirm"}
              </span>
              {s < 3 && <div className={`h-0.5 w-8 sm:w-16 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Select Date & Time</h2>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Available Dates</p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {availableDays.map((day) => (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 rounded-xl text-center transition-colors ${selectedDate?.toDateString() === day.toDateString() ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-blue-50 text-gray-700"}`}
                      >
                        <p className="text-xs font-medium">{DAY_NAMES[day.getDay()]}</p>
                        <p className="text-lg font-bold">{day.getDate()}</p>
                        <p className="text-xs">{MONTH_NAMES[day.getMonth()]}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Available Times</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-blue-50 text-gray-700"}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => selectedDate && selectedTime && setStep(2)}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed *</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a service...</option>
                    <option value={provider.subcategory}>{provider.subcategory}</option>
                    <option value="General Consultation">General Consultation</option>
                    <option value="Emergency Service">Emergency Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the issue, access instructions, or any special requirements..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors">Back</button>
                  <button
                    onClick={() => service && address && setStep(3)}
                    disabled={!service || !address}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Review Booking
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">Confirm Your Booking</h2>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { label: "Date", value: selectedDate ? `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}` : "" },
                    { label: "Time", value: selectedTime || "" },
                    { label: "Service", value: service },
                    { label: "Address", value: address },
                    { label: "Estimated Rate", value: `$${provider.hourlyRate}/hr` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                  {notes && (
                    <div className="pt-2 border-t border-gray-200 text-sm">
                      <p className="text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-700">{notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Payment Information</p>
                  <p className="text-blue-600">Payment is collected after the job is complete. You&apos;re protected by our satisfaction guarantee.</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors">Back</button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Provider summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Your Pro</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                  {provider.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{provider.name}</p>
                  <p className="text-sm text-gray-500">{provider.subcategory}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <StarRating rating={provider.rating} />
                <span className="text-sm font-medium">{provider.rating}</span>
                <span className="text-xs text-gray-400">({provider.reviewCount})</span>
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-blue-600">${provider.hourlyRate}<span className="text-sm font-normal text-gray-500">/hr</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
