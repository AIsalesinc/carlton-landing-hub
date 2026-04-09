import { fetchDashboardData } from "@/lib/fetcher";
import Navbar from "@/components/Navbar";
import NewsSection from "@/components/NewsSection";
import EventsSection from "@/components/EventsSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import DiningSection from "@/components/DiningSection";
import OccupancySection from "@/components/OccupancySection";
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
      <header className="relative pt-28 pb-20 px-6 bg-gradient-to-b from-[#20292C] to-[#1a1f22] overflow-hidden">
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
              fill="#20292C"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#26ACE8]/20 text-[#26ACE8] text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-[#26ACE8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26ACE8] animate-pulse" />
            Live updates every hour
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Carlton Landing
            <span className="block text-[#26ACE8]">Community Hub</span>
          </h1>
          <p className="text-lg text-[#999999] max-w-xl mx-auto leading-relaxed">
            Your centralized source for news, events, and dining in
            Carlton Landing, Oklahoma — on the shores of Lake Eufaula.
          </p>

          {/* Quick stat badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="inline-flex items-center gap-1.5 bg-[#2a353a] border border-[#616566] rounded-full px-4 py-2 text-sm text-white shadow-sm">
              📰 {data.news.length} news item{data.news.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#2a353a] border border-[#616566] rounded-full px-4 py-2 text-sm text-white shadow-sm">
              📅 {data.events.length} event{data.events.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#2a353a] border border-[#616566] rounded-full px-4 py-2 text-sm text-white shadow-sm">
              🎯 {data.activities.length} activit{data.activities.length !== 1 ? "ies" : "y"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#2a353a] border border-[#616566] rounded-full px-4 py-2 text-sm text-white shadow-sm">
              🍽️ {data.restaurants.length} restaurants
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#2a353a] border border-[#616566] rounded-full px-4 py-2 text-sm text-white shadow-sm">
              🏠 {data.occupancy.airbnb.totalListings + data.occupancy.vrbo.totalListings} rentals tracked
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <NewsSection news={data.news} />
        <EventsSection events={data.events} />
        <ActivitiesSection activities={data.activities} />
        <DiningSection restaurants={data.restaurants} />
        <OccupancySection occupancy={data.occupancy} />
        <QuickLinks />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#616566] py-8 px-6 bg-[#20292C]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#999999]">
          <p>
            RevFirma · Carlton Landing Community Hub
          </p>
          <p>
            Last updated: {updatedAt} CT
          </p>
        </div>
      </footer>
    </>
  );
}
