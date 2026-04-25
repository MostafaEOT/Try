"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">Servy</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Services</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Browse Services</Link>
            <Link href="/dashboard/provider" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Become a Pro</Link>
            <Link href="/dashboard/customer" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Bookings</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
              Sign up
            </Link>
          </div>

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

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
            <Link href="/services" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Browse Services</Link>
            <Link href="/dashboard/provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Become a Pro</Link>
            <Link href="/dashboard/customer" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">My Bookings</Link>
            <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Log in</Link>
            <Link href="/register" className="block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-center">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
