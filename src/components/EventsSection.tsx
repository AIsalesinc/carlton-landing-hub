import type { EventItem } from "@/lib/types";

export default function EventsSection({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <section id="events" className="py-16 px-6 bg-[#20292C]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">
            Upcoming Events
          </h2>
          <p className="text-[#999999] mb-8">
            Community happenings &amp; seasonal activities
          </p>
          <div className="rounded-2xl border border-[#616566] p-8 text-center bg-[#2a353a]">
            <p className="text-[#999999]">
              No upcoming events found. Check the{" "}
              <a
                href="https://carltonlandingfoundation.org/events/"
                className="text-[#26ACE8] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Foundation events page
              </a>{" "}
              or the{" "}
              <a
                href="https://carltonlanding.com/events-calendar/"
                className="text-[#26ACE8] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                community calendar
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 px-6 bg-[#20292C]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">
          Upcoming Events
        </h2>
        <p className="text-[#999999] mb-8">
          Community happenings &amp; seasonal activities
        </p>
        <div className="space-y-4">
          {events.map((event, i) => (
            <div
              key={i}
              className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#616566] p-5 bg-[#2a353a] hover:border-[#26ACE8] hover:shadow-lg transition-all"
            >
              {/* Date badge */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-center justify-center bg-[#26ACE8]/20 border border-[#26ACE8]/40 rounded-xl px-4 py-3 sm:w-28 sm:min-h-[5rem]">
                <span className="text-xs font-semibold text-[#26ACE8] uppercase tracking-wide text-center leading-tight">
                  {event.date}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white leading-snug">
                    {event.title}
                  </h3>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <svg
                        className="w-4 h-4 text-[#999999] hover:text-[#26ACE8] transition-colors mt-1"
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
                {event.time && (
                  <p className="text-sm text-[#26ACE8] font-medium mt-1">
                    {event.time}
                  </p>
                )}
                <p className="text-sm text-[#999999] leading-relaxed mt-2">
                  {event.description}
                </p>
                {event.location && (
                  <p className="text-xs text-[#999999] mt-2">
                    📍 {event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
