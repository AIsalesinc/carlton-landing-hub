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

export interface DateSnapshot {
  label: string;         // e.g. "Apr 11–13" or "This Weekend"
  checkIn: string;       // ISO date "2026-04-11"
  checkOut: string;      // ISO date "2026-04-13"
  availableListings: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface PlatformOccupancy {
  platform: string;
  totalListings: number;
  baselineAvgPrice: number | null;   // avg price across all dates (the "normal" rate)
  snapshots: DateSnapshot[];         // occupancy per upcoming date range
  listings: RentalListing[];         // sample listings from latest search
}

export interface OccupancyData {
  airbnb: PlatformOccupancy;
  vrbo: PlatformOccupancy;
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
