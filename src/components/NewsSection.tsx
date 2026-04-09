import type { NewsItem } from "@/lib/types";

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-[#2a353a] text-[#26ACE8] border border-[#616566]">
      {source}
    </span>
  );
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <section id="news" className="py-16 px-6 bg-[#20292C]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Latest News</h2>
          <p className="text-[#999999] mb-8">
            From the town and community
          </p>
          <div className="bg-[#2a353a] rounded-2xl border border-[#616566] p-8 text-center">
            <p className="text-[#999999]">
              No news items found right now. Check back soon or visit{" "}
              <a href="https://www.carltonlandingok.gov/" className="text-[#26ACE8] hover:underline" target="_blank" rel="noopener noreferrer">
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
    <section id="news" className="py-16 px-6 bg-[#20292C]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Latest News</h2>
        <p className="text-[#999999] mb-8">From the town and community</p>
        <div className="grid gap-4 md:grid-cols-2">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#2a353a] rounded-2xl border border-[#616566] p-6 hover:border-[#26ACE8] hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-white group-hover:text-[#26ACE8] transition-colors leading-snug">
                  {item.title}
                </h3>
                <svg className="w-4 h-4 text-[#999999] group-hover:text-[#26ACE8] shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-sm text-[#999999] leading-relaxed mb-3">
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
