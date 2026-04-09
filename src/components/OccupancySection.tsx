import type { OccupancyData, PlatformOccupancy, DateSnapshot } from "@/lib/types";

/* ── helpers ── */

function occupancyPct(total: number, available: number): number {
  if (total <= 0) return 0;
  return Math.round(((total - available) / total) * 100);
}

function surgeMultiplier(avg: number | null, baseline: number | null): number | null {
  if (!avg || !baseline || baseline <= 0) return null;
  return avg / baseline;
}

function pctColor(pct: number): string {
  if (pct >= 90) return "text-red-400";
  if (pct >= 75) return "text-amber-400";
  if (pct >= 50) return "text-[#26ACE8]";
  return "text-green-400";
}

function pctBarColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 75) return "bg-amber-500";
  if (pct >= 50) return "bg-[#26ACE8]";
  return "bg-green-500";
}

function surgeLabel(mult: number | null): { text: string; cls: string } | null {
  if (!mult) return null;
  if (mult >= 1.5) return { text: `${mult.toFixed(1)}x surge`, cls: "bg-red-500/20 text-red-400 border-red-500/30" };
  if (mult >= 1.2) return { text: `${mult.toFixed(1)}x above avg`, cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
  if (mult <= 0.8) return { text: `${((1 - mult) * 100).toFixed(0)}% below avg`, cls: "bg-green-500/20 text-green-300 border-green-500/30" };
  return null;
}

/* ── Weekend row ── */

function WeekendRow({
  snap,
  totalListings,
  baselineAvg,
}: {
  snap: DateSnapshot;
  totalListings: number;
  baselineAvg: number | null;
}) {
  const pct = occupancyPct(totalListings, snap.availableListings);
  const surge = surgeMultiplier(snap.avgPrice, baselineAvg);
  const badge = surgeLabel(surge);

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-[#20292C] group">
      {/* Date label */}
      <div className="w-28 shrink-0">
        <p className="text-sm font-medium text-white">{snap.label}</p>
        <p className="text-xs text-[#555555]">
          {snap.availableListings}/{totalListings} avail
        </p>
      </div>

      {/* Occupancy bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${pctColor(pct)}`}>{pct}%</span>
          <span className="text-xs text-[#999999]">booked</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className="h-2 rounded-full bg-[#616566]/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pctBarColor(pct)}`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0 w-20">
        {snap.avgPrice ? (
          <>
            <p className="text-sm font-bold text-white">${snap.avgPrice}</p>
            <p className="text-xs text-[#555555]">/night avg</p>
          </>
        ) : (
          <p className="text-xs text-[#555555]">—</p>
        )}
      </div>
    </div>
  );
}

/* ── Platform card ── */

function PlatformCard({ data }: { data: PlatformOccupancy }) {
  const isAirbnb = data.platform === "Airbnb";
  const hasSnapshots = data.snapshots.length > 0 && data.totalListings > 0;

  // Find the most booked weekend
  const mostBooked = hasSnapshots
    ? data.snapshots.reduce((best, s) => {
        const bestPct = occupancyPct(data.totalListings, best.availableListings);
        const sPct = occupancyPct(data.totalListings, s.availableListings);
        return sPct > bestPct ? s : best;
      })
    : null;
  const peakPct = mostBooked ? occupancyPct(data.totalListings, mostBooked.availableListings) : 0;

  // Find highest surge
  const highestSurge = hasSnapshots
    ? data.snapshots.reduce<number | null>((best, s) => {
        const m = surgeMultiplier(s.avgPrice, data.baselineAvgPrice);
        return m && (!best || m > best) ? m : best;
      }, null)
    : null;

  return (
    <div className="rounded-2xl border border-[#616566] p-6 bg-[#2a353a] hover:border-[#26ACE8] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
            <h3 className="font-semibold text-white">{data.platform}</h3>
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

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#20292C] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{data.totalListings || "—"}</p>
          <p className="text-xs text-[#999999]">Listings</p>
        </div>
        <div className="bg-[#20292C] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#26ACE8]">
            {data.baselineAvgPrice ? `$${data.baselineAvgPrice}` : "—"}
          </p>
          <p className="text-xs text-[#999999]">Avg/Night</p>
        </div>
        <div className="bg-[#20292C] rounded-xl p-3 text-center">
          <p className={`text-xl font-bold ${pctColor(peakPct)}`}>
            {peakPct > 0 ? `${peakPct}%` : "—"}
          </p>
          <p className="text-xs text-[#999999]">Peak Occ.</p>
        </div>
      </div>

      {/* Alert banner if near 100% or big surge */}
      {peakPct >= 85 && mostBooked && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400 font-semibold">
            🔥 Near sell-out: {mostBooked.label} is {peakPct}% booked
            {mostBooked.avgPrice ? ` — avg $${mostBooked.avgPrice}/night` : ""}
          </p>
        </div>
      )}
      {highestSurge && highestSurge >= 1.5 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-300 font-semibold">
            📈 Price surge detected: rates up to {highestSurge.toFixed(1)}x above baseline
          </p>
        </div>
      )}

      {/* Weekend-by-weekend breakdown */}
      {hasSnapshots ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">
            Weekend Occupancy & Pricing
          </p>
          {data.snapshots.map((snap) => (
            <WeekendRow
              key={snap.checkIn}
              snap={snap}
              totalListings={data.totalListings}
              baselineAvg={data.baselineAvgPrice}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 rounded-xl bg-[#20292C]">
          <p className="text-sm text-[#999999]">
            Occupancy data unavailable — {data.platform} may be blocking automated requests.
          </p>
          <a
            href={
              isAirbnb
                ? "https://www.airbnb.com/s/Carlton-Landing--OK/homes"
                : "https://www.vrbo.com/vacation-rentals/usa/oklahoma/carlton-landing"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs text-[#26ACE8] hover:underline"
          >
            Check {data.platform} directly →
          </a>
        </div>
      )}

      {/* Sample listings */}
      {data.listings.length > 0 && (
        <details className="mt-4 group/details">
          <summary className="text-xs font-semibold text-[#999999] uppercase tracking-wider cursor-pointer hover:text-[#26ACE8] transition-colors">
            Sample Listings ({data.listings.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {data.listings.slice(0, 6).map((listing, i) => (
              <a
                key={i}
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-[#20292C] hover:bg-[#20292C]/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate hover:text-[#26ACE8] transition-colors">
                    {listing.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#999999] mt-0.5">
                    {listing.bedrooms !== undefined && <span>{listing.bedrooms} bed</span>}
                    {listing.guests !== undefined && <span>· {listing.guests} guests</span>}
                    {listing.rating !== undefined && <span>· ⭐ {listing.rating.toFixed(1)}</span>}
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
        </details>
      )}
    </div>
  );
}

/* ── Main section ── */

export default function OccupancySection({
  occupancy,
}: {
  occupancy: OccupancyData;
}) {
  const totalListings = occupancy.airbnb.totalListings + occupancy.vrbo.totalListings;
  const hasAnyData = totalListings > 0;

  // Combined highest occupancy
  const allSnapshots = [
    ...occupancy.airbnb.snapshots.map((s) => ({
      ...s,
      total: occupancy.airbnb.totalListings,
    })),
    ...occupancy.vrbo.snapshots.map((s) => ({
      ...s,
      total: occupancy.vrbo.totalListings,
    })),
  ];
  const peakOcc = allSnapshots.reduce<number>((best, s) => {
    const pct = occupancyPct(s.total, s.availableListings);
    return pct > best ? pct : best;
  }, 0);

  // Combined price range
  const allPrices = [
    ...(occupancy.airbnb.baselineAvgPrice ? [occupancy.airbnb.baselineAvgPrice] : []),
    ...(occupancy.vrbo.baselineAvgPrice ? [occupancy.vrbo.baselineAvgPrice] : []),
  ];
  const combinedAvg =
    allPrices.length > 0
      ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      : null;

  return (
    <section id="occupancy" className="py-16 px-6 bg-[#20292C]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Rental Occupancy & Pricing
            </h2>
            <p className="text-[#999999]">
              Weekend-by-weekend availability, surge pricing, and how close to sold out Carlton Landing is
            </p>
          </div>
          {hasAnyData && (
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-xs text-[#999999]">Total Listings</p>
                <p className="text-lg font-bold text-white">{totalListings}</p>
              </div>
              {combinedAvg && (
                <div className="text-right">
                  <p className="text-xs text-[#999999]">Market Avg</p>
                  <p className="text-lg font-bold text-[#26ACE8]">${combinedAvg}/nt</p>
                </div>
              )}
              {peakOcc > 0 && (
                <div className="text-right">
                  <p className="text-xs text-[#999999]">Peak Occupancy</p>
                  <p className={`text-lg font-bold ${pctColor(peakOcc)}`}>{peakOcc}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Platform cards */}
        {hasAnyData ? (
          <div className="grid gap-6 md:grid-cols-2">
            <PlatformCard data={occupancy.airbnb} />
            <PlatformCard data={occupancy.vrbo} />
          </div>
        ) : (
          <div className="rounded-2xl border border-[#616566] p-8 text-center bg-[#2a353a]">
            <p className="text-[#999999] mb-4">
              Rental data is being fetched. Both Airbnb and VRBO may block automated requests — check directly:
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

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-[#555555]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> &lt;50% booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#26ACE8]" /> 50–74%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 75–89%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 90%+ near sell-out
          </span>
        </div>

        <p className="text-xs text-[#555555] mt-4 text-center">
          Occupancy estimated by comparing available listings with/without date filters.
          Prices reflect nightly rates and vary by date. Refreshes hourly. Not financial advice.
        </p>
      </div>
    </section>
  );
}
