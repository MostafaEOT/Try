"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProviderById } from "@/data/providers";
import Link from "next/link";

const CUSTOMER_X = 74;
const WORKER_START = 6;
const WORKER_END = 68;

function MapView({ workerX, arrived }: { workerX: number; arrived: boolean }) {
  return (
    <div
      className="relative w-full h-64 overflow-hidden"
      style={{
        background: "#eaf1fb",
        backgroundImage:
          "linear-gradient(rgba(160,190,220,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(160,190,220,0.35) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    >
      {/* Decorative building blocks */}
      <div className="absolute rounded bg-blue-200/60"   style={{ width:56,height:44,left:"7%",  top:"11%"}} />
      <div className="absolute rounded bg-amber-200/60"  style={{ width:40,height:52,left:"22%", top:"7%" }} />
      <div className="absolute rounded bg-green-200/60"  style={{ width:64,height:38,left:"42%", top:"13%"}} />
      <div className="absolute rounded bg-rose-200/60"   style={{ width:48,height:46,left:"62%", top:"9%"}} />
      <div className="absolute rounded bg-slate-200/60"  style={{ width:36,height:40,left:"7%",  top:"60%"}} />
      <div className="absolute rounded bg-amber-100/60"  style={{ width:52,height:36,left:"28%", top:"63%"}} />
      <div className="absolute rounded bg-purple-200/60" style={{ width:44,height:48,left:"58%", top:"59%"}} />

      {/* Road */}
      <div
        className="absolute left-0 right-0 bg-[#d0d6dc]"
        style={{ height: 36, top: "50%", transform: "translateY(-50%)" }}
      >
        <div
          className="absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 18px, transparent 18px, transparent 36px)",
            backgroundSize: "36px 100%",
          }}
        />
      </div>

      {/* Route line */}
      {!arrived && (
        <div
          className="absolute rounded-full bg-blue-500/50 transition-all duration-1000"
          style={{
            height: 3,
            top: "50%",
            transform: "translateY(-50%)",
            left: `${workerX + 2.5}%`,
            right: `${100 - CUSTOMER_X + 2.5}%`,
          }}
        />
      )}

      {/* Customer pin */}
      <div
        className="absolute flex flex-col items-center z-20"
        style={{ left: `${CUSTOMER_X}%`, top: "50%", transform: "translate(-50%, -105%)" }}
      >
        <div
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-white transition-all duration-500 ${
            arrived ? "bg-green-500 scale-125" : "bg-blue-600"
          }`}
        >
          🏠
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-600 -mt-0.5" />
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md mt-1 whitespace-nowrap">
          You
        </span>
      </div>

      {/* Worker pin */}
      <div
        className="absolute flex flex-col items-center z-20 transition-all duration-1000"
        style={{ left: `${workerX}%`, top: "50%", transform: "translate(-50%, -105%)" }}
      >
        <div
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-white ${
            arrived ? "bg-green-500" : "bg-white animate-bounce"
          }`}
        >
          {arrived ? "✅" : "🔧"}
        </div>
        <div
          className={`w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent -mt-0.5 ${
            arrived ? "border-t-green-500" : "border-t-gray-700"
          }`}
        />
        <span
          className={`text-white text-xs font-bold px-2 py-0.5 rounded-md mt-1 whitespace-nowrap ${
            arrived ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          Pro
        </span>
      </div>
    </div>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId") ?? "p1";
  const address = searchParams.get("address") ?? "Your location";
  const etaMin = Math.max(1, parseInt(searchParams.get("eta") ?? "6", 10));
  const provider = getProviderById(providerId);

  const totalSeconds = etaMin * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [workerX, setWorkerX] = useState(WORKER_START);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      const progress = Math.min(elapsed / totalSeconds, 1);
      setSecondsLeft(totalSeconds - elapsed);
      setWorkerX(WORKER_START + progress * (WORKER_END - WORKER_START));
      if (elapsed >= totalSeconds) {
        clearInterval(interval);
        setArrived(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const minsLeft = Math.floor(secondsLeft / 60);
  const secsLeft = secondsLeft % 60;
  const progressPct = Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100));
  const isClose = progressPct >= 75 && !arrived;

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Provider not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/dashboard/customer" className="text-gray-500 hover:text-gray-700 p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-sm leading-tight">Live Tracking</h1>
          <p className="text-xs text-gray-500 truncate">
            {arrived
              ? "Your pro has arrived!"
              : `${provider.name} · ${minsLeft}m ${secsLeft.toString().padStart(2, "0")}s away`}
          </p>
        </div>
        {!arrived ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full flex-shrink-0">
            ✅ ARRIVED
          </span>
        )}
      </div>

      {/* Map */}
      <MapView workerX={workerX} arrived={arrived} />

      {/* ETA card overlapping map */}
      <div className="relative z-10 -mt-8 mx-4 max-w-lg md:mx-auto">
        <div
          className={`rounded-2xl shadow-lg p-4 text-center transition-colors duration-500 ${
            arrived ? "bg-green-600" : isClose ? "bg-orange-500" : "bg-blue-600"
          }`}
        >
          {arrived ? (
            <p className="text-white font-bold text-lg">🎉 Your pro has arrived!</p>
          ) : (
            <>
              <p className="text-white/80 text-xs font-medium">Estimated arrival in</p>
              <p className="text-white font-bold text-4xl leading-none mt-0.5 tabular-nums">
                {minsLeft > 0
                  ? `${minsLeft}:${secsLeft.toString().padStart(2, "0")}`
                  : `0:${secsLeft.toString().padStart(2, "0")}`}
                <span className="text-lg font-normal text-white/70 ml-1">{minsLeft > 0 ? "min" : "sec"}</span>
              </p>
              {isClose && <p className="text-white/80 text-xs mt-1">📍 Almost there!</p>}
            </>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 max-w-lg md:mx-auto">
        {/* Progress bar */}
        {!arrived && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Pro dispatched</span>
              <span className="font-semibold text-blue-600">{progressPct}% of trip</span>
              <span>At your door</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Provider card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Pro</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                {provider.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.subcategory}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-sm font-semibold text-gray-700">{provider.rating}</span>
                <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
                {provider.verified && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900">
                ${provider.hourlyRate}
                <span className="text-xs font-normal text-gray-400">/hr</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{provider.responseTime}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Message
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Service Address</p>
            <p className="font-semibold text-gray-900 text-sm">{address}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {arrived ? "✅ Pro is here" : "🧭 Pro is navigating here"}
            </p>
          </div>
        </div>

        {/* Post-arrival actions */}
        {arrived && (
          <div className="space-y-2 pt-1">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors text-base">
              ✅ Confirm Job Started
            </button>
            <Link
              href="/dashboard/customer"
              className="block w-full text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-2xl transition-colors"
            >
              View My Bookings
            </Link>
          </div>
        )}

        {/* Safety note */}
        <p className="text-xs text-center text-gray-400 pt-1">
          🔒 Your payment is held securely and only released after job completion.
        </p>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
