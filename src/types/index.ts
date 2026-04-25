export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  count: number;
  subcategories: string[];
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  categoryId: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  bio: string;
  location: string;
  experience: number;
  completedJobs: number;
  responseTime: string;
  verified: boolean;
  badges: string[];
  availability: string[];
  reviews: Review[];
  portfolio: string[];
  online: boolean;
  distanceKm: number;
  acceptanceRate: number;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  price: number;
  address: string;
  notes?: string;
}
