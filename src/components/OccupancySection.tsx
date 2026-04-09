import type { OccupancyData, RentalStats } from "@/lib/types";

function PriceBar({
  min,
  max,
  avg,
  label,
}: {
  min: number;
  max: number;
  avg: number;
  label: string;
}) {
  // Normalize for visual bar (0-100%)
  const range = max - min || 1;
  const avgPos = ((avg - min) / range) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#999999]">
        <span>${min}/night</span>
        <span className="text-[#26ACE8] font-semibold">
          avg ${avg}/night
        </span>
        <span>${max}/night</span>
      </div>
      <div className="relative h-2 rounded-full bg-[#616566]/40 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-[#26ACE8] to-red-400 rounded-full"
          style={{ width: "100%" }}
        />
        {/* Average marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#26ACE8] shadow-lg"
          style={{ left: `${Math.max(5, Math.min(95, avgPos))}%` }}
        />
      </div>
    </div>
  );
}

function PlatformCard({ stats }: { stats: RentalStats }) {
  const hasPrices = stats.avgPrice !== null && stats.minPrice !== null && stats.maxPrice !== null;
  const isAirbnb = stats.platform === "Airbnb";

  return (
    <div className="rounded-2xl border border-[#616566] p-6 bg-[#2a353a] hover:border-[#26ACE8] transition-all">
      {/* Platform header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
              isAirbnb
                ? "bg-[#FF5A5F]/20 text-[#FF5A5F]"
                : "bg-[#3B5998]/20 text-[#6E93D6]"
            }`}
          >
            {isAirbnb ? "A" : "V"}
          </div>
          <div>
            <h3 className="font-semibold text-white">{stats.platform}</h3>
            <p className="text-xs text-[#999999]">Carlton Landing area</p>
          </div>
        </div>
        <a
          href={
            isAirbnb
              ? "https://www.airbnb.com/s/Carlton-Landing--OK/homes"
              : "https://www.vrbo.com/vacation-rentals/usa/oklahoma/carlton-landing"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#26ACE8] hover:underline"
        >
          View all →
        </a>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#20292C] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">
            {stats.totalListings || "—"}
          </p>
          <p className="text-xs text-[#999999] mt-0.5">Total Listings</p>
        </div>
        <div className="bg-[#20292C] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#26ACE8]">
            {hasPrices ? `$${stats.avgPrice}` : "—"}
          </p>
          <p className="text-xs text-[#999999] mt-0.5">Avg/Night</p>
        </div>
      </div>

      {/* Price range bar */}
      {hasPrices && stats.minPrice !== null && stats.maxPrice !== null && stats.avgPrice !== null ? (
        <PriceBar
          min={stats.minPrice}
          max={stats.maxPrice}
          avg={stats.avgPrice}
          label={stats.platform}
        />
      ) : (
        <div className="text-center py-3 rounded-xl bg-[#20292C]">
          <p className="text-xs text-[#999999]">
            Price data unavailable — check the platform directly
          </p>
        </div>
      )}

      {/* Top listings preview */}
      {stats.listings.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold text-[#999999] uppercase tracking-wider">
            Sample Listings
          </p>
          {stats.listings.slice(0, 4).map((listing, i) => (
            <a
              key={i}
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-[#20292C] hover:bg-[#20292C]/80 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate group-hover:text-[#26ACE8] transition-colors">
                  {listing.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#999999] mt-0.5">
                  {listing.bedrooms && <span>{listing.bedrooms} bed</span>}
                  {listing.guests && <span>· {listing.guests} guests</span>}
                  {listing.rating && <span>· ⭐ {listing.rating.toFixed(1)}</span>}
                  {listing.reviews && <span>({listing.reviews})</span>}
                </div>
              </div>
              {listing.price && (
                <span className="shrink-0 text-sm font-semibold text-[#26ACE8]">
                  ${listing.price}
                  <span className="text-xs text-[#999999] font-normal">/nt</span>
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OccupancySection({
  occupancy,
}: {
  occupancy: OccupancyData;
}) {
  const totalListings =
    occupancy.airbnb.totalListings + occupancy.vrbo.totalListings;
  const hasAnyData = totalListings > 0;

  // Combined avg price
  const prices = [occupancy.airbnb.avgPrice, occupancy.vrbo.avgPrice].filter(
    (p): p is number => p !== null
  );
  const combinedAvg =
    prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : null;

  return (
    <section id="occupancy" className="py-16 px-6 bg-[#20292C]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Rental Market & Pricing
            </h2>
            <p className="text-[#999999]">
              Airbnb &amp; VRBO listings, average nightly rates &amp; price
              ranges
            </p>
          </div>
          {hasAnyData && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[#999999]">Combined Listings</p>
                <p className="text-lg font-bold text-white">{totalListings}</p>
              </div>
              {combinedAvg && (
                <div className="text-right">
                  <p className="text-xs text-[#999999]">Market Avg</p>
                  <p className="text-lg font-bold text-[#26ACE8]">
                    ${combinedAvg}/nt
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {hasAnyData ? (
          <div className="grid gap-6 md:grid-cols-2">
            <PlatformCard stats={occupancy.airbnb} />
            <PlatformCard stats={occupancy.vrbo} />
          </div>
        ) : (
          <div className="rounded-2xl border border-[#616566] p-8 text-center bg-[#2a353a]">
            <p className="text-[#999999] mb-4">
              Rental data is being fetched from Airbnb and VRBO. If both
              platforms are blocking requests, try checking directly:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.airbnb.com/s/Carlton-Landing--OK/homes"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                Airbnb →
              </a>
              <a
                href="https://www.vrbo.com/vacation-rentals/usa/oklahoma/carlton-landing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs"
              >
                VRBO →
              </a>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[#555555] mt-6 text-center">
          Data scraped from public listing pages. Prices reflect nightly rates
          and may vary by date, season, and availability. Not financial advice.
        </p>
      </div>
    </section>
  );
}
