const links = [
  {
    label: "Town Government",
    url: "https://www.carltonlandingok.gov/",
    description: "Official town website, ordinances, meetings",
    icon: "🏛️",
  },
  {
    label: "Community Site",
    url: "https://carltonlanding.com/",
    description: "Real estate, discovery, and lifestyle",
    icon: "🏘️",
  },
  {
    label: "Foundation Events",
    url: "https://carltonlandingfoundation.org/events/",
    description: "Seasonal events and community activities",
    icon: "🎉",
  },
  {
    label: "Events Calendar",
    url: "https://carltonlanding.com/events-calendar/",
    description: "Full community events calendar",
    icon: "📅",
  },
  {
    label: "The Meeting House",
    url: "https://www.themeetinghousecl.com/",
    description: "Restaurant, coffee, and gathering spot",
    icon: "☕",
  },
  {
    label: "Choctaw Country Guide",
    url: "https://choctawcountry.com/carlton-landing/",
    description: "Regional tourism and area info",
    icon: "🗺️",
  },
];

export default function QuickLinks() {
  return (
    <section id="links" className="py-16 px-6 bg-[#20292C]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Quick Links</h2>
        <p className="text-[#999999] mb-8">Essential Carlton Landing resources</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-[#616566] p-4 bg-[#2a353a] hover:border-[#26ACE8] hover:shadow-lg transition-all"
            >
              <span className="text-xl mt-0.5">{link.icon}</span>
              <div>
                <p className="font-medium text-white group-hover:text-[#26ACE8] transition-colors text-sm">
                  {link.label}
                </p>
                <p className="text-xs text-[#999999] mt-0.5">
                  {link.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
