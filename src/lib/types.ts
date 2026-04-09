export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
  date?: string;
}

export interface EventItem {
  title: string;
  date: string;
  time?: string;
  description: string;
  location?: string;
  url?: string;
}

export interface Restaurant {
  name: string;
  description: string;
  hours: { day: string; hours: string }[];
  phone?: string;
  url?: string;
  tags: string[];
}

export interface Activity {
  name: string;
  description: string;
  url?: string;
  source: string;
  tags: string[];
}

export interface RentalListing {
  name: string;
  price: number | null; // per night in USD
  url: string;
  platform: "airbnb" | "vrbo";
  rating?: number;
  reviews?: number;
  bedrooms?: number;
  guests?: number;
}

export interface RentalStats {
  platform: string;
  totalListings: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  listings: RentalListing[];
}

export interface OccupancyData {
  airbnb: RentalStats;
  vrbo: RentalStats;
  lastChecked: string;
}

export interface DashboardData {
  news: NewsItem[];
  events: EventItem[];
  restaurants: Restaurant[];
  activities: Activity[];
  occupancy: OccupancyData;
  lastUpdated: string;
}
