import { fetchDashboardData } from "@/lib/fetcher";
import Navbar from "@/components/Navbar";
import NewsSection from "@/components/NewsSection";
import EventsSection from "@/components/EventsSection";
import DiningSection from "@/components/DiningSection";
import QuickLinks from "@/components/QuickLinks";

export const revalidate = 3600; // re-fetch data every hour

export default async function Home() {
  const data = await fetchDashboardData();

  const updatedAt = new Date(data.lastUpdated).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <Navbar />

      {/* Hero */}
      <header className="relative pt-28 pb-20 px-6 bg-gradient-to-b from-blue-50 to-slate-50 overflow-hidden">
        {/* Subtle wave decoration */}
        <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0V30Z"
              fill="#f8fafc"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live updates every hour
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Carlton Landing
            <span className="block text-blue-600">Community Hub</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Your centralized source for news, events, and dining in
            Carlton Landing, Oklahoma — on the shores of Lake Eufaula.
          </p>

          {/* Quick stat badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600 shadow-sm">
              📰 {data.news.length} news item{data.news.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600 shadow-sm">
              📅 {data.events.length} event{data.events.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600 shadow-sm">
              🍽️ {data.restaurants.length} restaurants
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <NewsSection news={data.news} />
        <EventsSection events={data.events} />
        <DiningSection restaurants={data.restaurants} />
        <QuickLinks />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>
            Carlton Landing Hub · Community information dashboard
          </p>
          <p>
            Last updated: {updatedAt} CT
          </p>
        </div>
      </footer>
    </>
  );
}
