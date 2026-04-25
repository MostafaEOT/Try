import Link from "next/link";
import { Provider } from "@/types";
import StarRating from "./StarRating";

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {provider.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
              {provider.verified && (
                <span className="text-blue-500" title="Verified">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{provider.subcategory}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={provider.rating} />
              <span className="text-sm font-semibold text-gray-700">{provider.rating}</span>
              <span className="text-xs text-gray-400">({provider.reviewCount})</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900">${provider.hourlyRate}</p>
            <p className="text-xs text-gray-400">/hr</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {provider.badges.slice(0, 3).map((badge) => (
            <span key={badge} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {provider.location}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Responds {provider.responseTime}
          </div>
        </div>
      </div>

      <Link href={`/provider/${provider.id}`} className="block">
        <div className="px-5 pb-5">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            View Profile & Book
          </button>
        </div>
      </Link>
    </div>
  );
}
