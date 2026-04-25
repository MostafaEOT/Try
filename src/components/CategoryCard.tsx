import Link from "next/link";
import { ServiceCategory } from "@/types";

export default function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Link href={`/services/${category.id}`}>
      <div className={`${category.bgColor} rounded-xl p-5 cursor-pointer hover:scale-105 transition-transform duration-200 border border-transparent hover:border-blue-200 group`}>
        <div className="text-3xl mb-3">{category.icon}</div>
        <h3 className={`font-semibold text-gray-900 group-hover:${category.color}`}>{category.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
        <p className="text-xs text-gray-400 mt-2">{category.count}+ pros</p>
      </div>
    </Link>
  );
}
