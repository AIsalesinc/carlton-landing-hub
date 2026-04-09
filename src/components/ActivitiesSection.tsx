import type { Activity } from "@/lib/types";

const tagColors: Record<string, string> = {
  "Water Sports": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Family: "bg-green-500/20 text-green-300 border-green-500/30",
  "Reservations Required": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Local Attraction": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Events: "bg-[#26ACE8]/20 text-[#26ACE8] border-[#26ACE8]/30",
  Tours: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Community Event": "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

function getTagStyle(tag: string) {
  return tagColors[tag] || "bg-[#616566]/30 text-[#999999] border-[#616566]";
}

const sourceIcons: Record<string, string> = {
  "Lake Days Aqua Park": "🌊",
  "LakeStay Guide": "🏡",
  "CL Events & Tours": "🎉",
  "CL Foundation": "🤝",
};

export default function ActivitiesSection({
  activities,
}: {
  activities: Activity[];
}) {
  if (activities.length === 0) {
    return (
      <section id="activities" className="py-16 px-6 bg-[#1a1f22]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">
            Activities & Things to Do
          </h2>
          <p className="text-[#999999] mb-8">
            Local attractions, tours &amp; outdoor adventures
          </p>
          <div className="rounded-2xl border border-[#616566] p-8 text-center bg-[#2a353a]">
            <p className="text-[#999999]">
              No activities found right now. Check{" "}
              <a
                href="https://www.carltonlandingevents.com/"
                className="text-[#26ACE8] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Carlton Landing Events
              </a>{" "}
              or{" "}
              <a
                href="https://lakedayscl.com/"
                className="text-[#26ACE8] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lake Days Aqua Park
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Group activities by source
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.source]) acc[a.source] = [];
    acc[a.source].push(a);
    return acc;
  }, {});

  return (
    <section id="activities" className="py-16 px-6 bg-[#1a1f22]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">
          Activities & Things to Do
        </h2>
        <p className="text-[#999999] mb-8">
          Local attractions, tours &amp; outdoor adventures
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-[#616566] p-5 bg-[#2a353a] hover:border-[#26ACE8] hover:shadow-lg transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {sourceIcons[activity.source] || "🎯"}
                  </span>
                  <span className="text-xs font-medium text-[#26ACE8] uppercase tracking-wide">
                    {activity.source}
                  </span>
                </div>
                {activity.url && (
                  <a
                    href={activity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <svg
                      className="w-4 h-4 text-[#999999] hover:text-[#26ACE8] transition-colors"
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

              <h3 className="font-semibold text-white leading-snug mb-2">
                {activity.name}
              </h3>
              <p className="text-sm text-[#999999] leading-relaxed flex-1">
                {activity.description}
              </p>

              {activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activity.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-0.5 rounded-full border ${getTagStyle(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
