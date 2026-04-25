import Link from "next/link";
import ProviderCard from "@/components/ProviderCard";
import { categories } from "@/data/categories";
import { getProvidersByCategory } from "@/data/providers";

export function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.id }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryId } = await params;
  const category = categories.find((c) => c.id === categoryId);
  const categoryProviders = getProvidersByCategory(categoryId);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
          <Link href="/services" className="text-blue-600 hover:underline">Browse all services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${category.bgColor} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-blue-600">Services</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{category.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{category.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600 mt-1">{category.description}</p>
              <p className="text-sm text-gray-400 mt-1">{category.count}+ professionals available</p>
            </div>
          </div>

          {/* Subcategories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {category.subcategories.map((sub) => (
              <span key={sub} className="bg-white/80 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 cursor-pointer hover:bg-white hover:border-blue-400 transition-colors">
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Providers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categoryProviders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{category.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No providers listed yet</h2>
            <p className="text-gray-500 mb-6">Be the first to offer {category.name} services in your area!</p>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              Join as a Pro
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{categoryProviders.length} {category.name} Professionals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </>
        )}

        {/* Other categories */}
        <div className="mt-16">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore Other Services</h3>
          <div className="flex flex-wrap gap-3">
            {categories.filter((c) => c.id !== categoryId).slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/services/${cat.id}`} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
