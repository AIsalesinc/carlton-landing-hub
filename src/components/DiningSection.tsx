import type { Restaurant } from "@/lib/types";

function StatusDot({ hours }: { hours: string }) {
  const lower = hours.toLowerCase();
  if (lower.includes("closed")) {
    return <span className="inline-block w-2 h-2 rounded-full bg-red-400" />;
  }
  if (lower.includes("seasonal") || lower.includes("check")) {
    return <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />;
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />;
}

export default function DiningSection({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  return (
    <section id="dining" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Dining &amp; Drinks
        </h2>
        <p className="text-slate-500 mb-8">
          Restaurants and cafés in Carlton Landing
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {restaurants.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-lg text-slate-900">
                  {r.name}
                </h3>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 shrink-0 mt-1"
                    aria-label={`Visit ${r.name} website`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {r.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hours */}
              <div className="border-t border-slate-100 pt-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Hours
                </p>
                {r.hours.map((h, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot hours={h.hours} />
                      <span className="text-slate-600">{h.day}</span>
                    </div>
                    <span className="text-slate-900 font-medium">
                      {h.hours}
                    </span>
                  </div>
                ))}
              </div>

              {r.phone && (
                <p className="text-sm text-slate-500 mt-3">📞 {r.phone}</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Hours may vary seasonally. Always call ahead or check social media for
          the latest.
        </p>
      </div>
    </section>
  );
}
