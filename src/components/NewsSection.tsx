import type { NewsItem } from "@/lib/types";

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
      {source}
    </span>
  );
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <section id="news" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Latest News</h2>
          <p className="text-slate-500 mb-8">
            From the town and community
          </p>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">
              No news items found right now. Check back soon or visit{" "}
              <a href="https://www.carltonlandingok.gov/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                carltonlandingok.gov
              </a>{" "}
              directly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Latest News</h2>
        <p className="text-slate-500 mb-8">From the town and community</p>
        <div className="grid gap-4 md:grid-cols-2">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {item.title}
                </h3>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                {item.snippet}
              </p>
              <SourceBadge source={item.source} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
