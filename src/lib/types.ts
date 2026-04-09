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

export interface DashboardData {
  news: NewsItem[];
  events: EventItem[];
  restaurants: Restaurant[];
  lastUpdated: string;
}
