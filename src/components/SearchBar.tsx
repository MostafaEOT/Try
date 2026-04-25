"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
}

export default function SearchBar({ large = false, placeholder = "What service do you need?" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("loc", location);
    router.push(`/services?${params.toString()}`);
  };

  if (large) {
    return (
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
        <div className="flex-1 flex items-center bg-white rounded-xl border border-gray-200 shadow-sm px-4 gap-2">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full py-3.5 text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm px-4 gap-2 sm:w-44">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or ZIP"
            className="w-full py-3.5 text-gray-800 placeholder-gray-400 outline-none bg-transparent text-sm"
          />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors whitespace-nowrap">
          Search
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-200 px-3 gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-2 text-gray-800 placeholder-gray-400 outline-none bg-transparent text-sm"
        />
      </div>
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
        Search
      </button>
    </form>
  );
}
