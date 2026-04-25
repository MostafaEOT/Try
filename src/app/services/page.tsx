"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CategoryCard from "@/components/CategoryCard";
import ProviderCard from "@/components/ProviderCard";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/data/categories";
import { providers } from "@/data/providers";

const sortOptions = ["Recommended", "Highest Rated", "Most Reviews", "Lowest Price", "Highest Price"];
const priceRanges = ["Any", "Under $50/hr", "$50–$80/hr", "$80–$120/hr", "$120+/hr"];

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("Recommended");
  const [priceRange, setPriceRange] = useState("Any");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view, setView] = useState<"providers" | "categories">("categories");

  const filteredProviders = useMemo(() => {
    let result = [...providers];
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase()) || p.bio.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory) result = result.filter((p) => p.categoryId === selectedCategory);
    if (verifiedOnly) result = result.filter((p) => p.verified);
    if (priceRange !== "Any") {
      if (priceRange === "Under $50/hr") result = result.filter((p) => p.hourlyRate < 50);
      if (priceRange === "$50–$80/hr") result = result.filter((p) => p.hourlyRate >= 50 && p.hourlyRate <= 80);
      if (priceRange === "$80–$120/hr") result = result.filter((p) => p.hourlyRate > 80 && p.hourlyRate <= 120);
      if (priceRange === "$120+/hr") result = result.filter((p) => p.hourlyRate > 120);
    }
    if (sortBy === "Highest Rated") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "Most Reviews") result.sort((a, b) => b.reviewCount - a.reviewCount);
    if (sortBy === "Lowest Price") result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    if (sortBy === "Highest Price") result.sort((a, b) => b.hourlyRate - a.hourlyRate);
    return result;
  }, [search, selectedCategory, sortBy, priceRange, verifiedOnly]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find a Service Professional</h1>
          <SearchBar placeholder="Search services or providers..." />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            <button onClick={() => setView("categories")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "categories" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              Categories
            </button>
            <button onClick={() => setView("providers")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "providers" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              Browse Pros
            </button>
          </div>
        </div>

        {view === "categories" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">{filteredCategories.length} categories found</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCategories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20 space-y-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <button onClick={() => setSelectedCategory(null)} className={`w-full text-left px-2 py-1.5 rounded text-sm ${!selectedCategory ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${selectedCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                  <div className="space-y-1.5">
                    {priceRanges.map((range) => (
                      <button key={range} onClick={() => setPriceRange(range)} className={`w-full text-left px-2 py-1.5 rounded text-sm ${priceRange === range ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Verified Only</span>
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${verifiedOnly ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
            </aside>

            {/* Provider grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">{filteredProviders.length} professionals found</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>

              {filteredProviders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pros found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <ServicesContent />
    </Suspense>
  );
}
