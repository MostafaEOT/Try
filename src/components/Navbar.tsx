"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">Servy</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">Services</span>
          </Link>

          {/* ── GUEST desktop nav ── */}
          {!user && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Browse Services</Link>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</Link>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
                  Sign up
                </Link>
              </div>
            </>
          )}

          {/* ── CUSTOMER desktop nav ── */}
          {user?.role === "customer" && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Browse Services</Link>
                <Link href="/request" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Book Now</Link>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</Link>
                <Link href="/dashboard/customer" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Bookings</Link>
              </div>
              <div className="hidden md:flex items-center relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(" ")[0]}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard/customer" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        📋 My Bookings
                      </Link>
                      <Link href="/request" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        ⚡ Book a Service
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          🚪 Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── WORKER desktop nav ── */}
          {user?.role === "worker" && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard/provider" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Jobs</Link>
                <Link href="/dashboard/provider" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Earnings</Link>
              </div>
              <div className="hidden md:flex items-center relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.avatar}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full transition-colors ${user.isActive !== false ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(" ")[0]}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${user.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {user.isActive !== false ? "🟢 Active" : "⚫ Offline"}
                        </span>
                      </div>
                      <Link href="/dashboard/provider" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        📋 Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          🚪 Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            {!user && (
              <>
                <Link href="/services" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">Browse Services</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">About Us</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">Log in</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-center">Sign up</Link>
              </>
            )}
            {user?.role === "customer" && (
              <>
                <div className="px-4 py-2 border-b border-gray-100 mb-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{user.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">Customer</p>
                  </div>
                </div>
                <Link href="/services" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">Browse Services</Link>
                <Link href="/request" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">Book Now</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">About Us</Link>
                <Link href="/dashboard/customer" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">My Bookings</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium">Log Out</button>
              </>
            )}
            {user?.role === "worker" && (
              <>
                <div className="px-4 py-2 border-b border-gray-100 mb-1 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{user.avatar}</div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className={`text-xs font-medium ${user.isActive !== false ? "text-green-600" : "text-gray-400"}`}>
                      {user.isActive !== false ? "🟢 Active" : "⚫ Offline"}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/provider" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">My Jobs</Link>
                <Link href="/dashboard/provider" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">Earnings</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium">Log Out</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
