import * as cheerio from "cheerio";
import type { NewsItem, EventItem, Restaurant, DashboardData } from "./types";

// ─── News: scrape Carlton Landing town gov + community site ───

async function fetchNews(): Promise<NewsItem[]> {
  const news: NewsItem[] = [];

  // Try town government site
  try {
    const res = await fetch("https://www.carltonlandingok.gov/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // Look for news/announcement sections
      $("article, .news-item, .post, .announcement, .widget_text, .entry")
        .slice(0, 5)
        .each((_, el) => {
          const title =
            $(el).find("h2, h3, h4, .title, .entry-title").first().text().trim() ||
            $(el).find("a").first().text().trim();
          const snippet =
            $(el).find("p, .excerpt, .summary, .entry-content").first().text().trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 3) {
            news.push({
              title: title.slice(0, 120),
              snippet: snippet.slice(0, 200) || "Visit the town website for details.",
              url: link.startsWith("http")
                ? link
                : `https://www.carltonlandingok.gov${link}`,
              source: "Town of Carlton Landing",
            });
          }
        });
    }
  } catch {
    // silently continue
  }

  // Try main Carlton Landing community site
  try {
    const res = await fetch("https://carltonlanding.com/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $("article, .post, .news, .blog-post, .entry, section h2, section h3")
        .slice(0, 5)
        .each((_, el) => {
          const title =
            $(el).find("h2, h3, h4, .title").first().text().trim() ||
            $(el).text().trim();
          const snippet =
            $(el).find("p").first().text().trim() ||
            $(el).next("p").text().trim();
          const link = $(el).find("a").first().attr("href") || $(el).closest("a").attr("href") || "";

          if (title && title.length > 3 && title.length < 120) {
            news.push({
              title,
              snippet: snippet.slice(0, 200) || "See more at carltonlanding.com",
              url: link.startsWith("http")
                ? link
                : `https://carltonlanding.com${link}`,
              source: "Carlton Landing",
            });
          }
        });
    }
  } catch {
    // silently continue
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return news.filter((n) => {
    const key = n.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

// ─── Events: scrape foundation + events calendar ───

async function fetchEvents(): Promise<EventItem[]> {
  const events: EventItem[] = [];

  // Carlton Landing Foundation events
  try {
    const res = await fetch("https://carltonlandingfoundation.org/events/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $(
        ".tribe-events-calendar-list__event, .type-tribe_events, .tribe-events-list .tribe-events-event, article, .event-item, .event, .tribe-common-g-row"
      )
        .slice(0, 10)
        .each((_, el) => {
          const title = $(el)
            .find(
              "h2, h3, .tribe-events-calendar-list__event-title, .tribe-events-list-event-title, .event-title"
            )
            .first()
            .text()
            .trim();
          const date = $(el)
            .find(
              "time, .tribe-events-calendar-list__event-datetime, .tribe-event-schedule-details, .event-date, .date"
            )
            .first()
            .text()
            .trim();
          const desc = $(el)
            .find(
              "p, .tribe-events-calendar-list__event-description, .event-description, .description"
            )
            .first()
            .text()
            .trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 2) {
            events.push({
              title: title.slice(0, 120),
              date: date || "See website for date",
              description: desc.slice(0, 250) || "Visit the foundation site for details.",
              url: link.startsWith("http")
                ? link
                : `https://carltonlandingfoundation.org${link}`,
            });
          }
        });
    }
  } catch {
    // continue
  }

  // Carlton Landing events calendar
  try {
    const res = await fetch("https://carltonlanding.com/events-calendar/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $(
        ".tribe-events-calendar-list__event, .type-tribe_events, article, .event, .tribe-common-g-row"
      )
        .slice(0, 10)
        .each((_, el) => {
          const title = $(el)
            .find("h2, h3, .tribe-events-calendar-list__event-title, .event-title")
            .first()
            .text()
            .trim();
          const date = $(el)
            .find("time, .tribe-event-schedule-details, .event-date, .date")
            .first()
            .text()
            .trim();
          const desc = $(el).find("p, .description").first().text().trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 2) {
            events.push({
              title: title.slice(0, 120),
              date: date || "See website for date",
              description: desc.slice(0, 250) || "Check the events calendar for details.",
              url: link.startsWith("http")
                ? link
                : `https://carltonlanding.com${link}`,
            });
          }
        });
    }
  } catch {
    // continue
  }

  // Deduplicate
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

// ─── Restaurants: curated data + live scraping for hours ───

function getBaseRestaurants(): Restaurant[] {
  return [
    {
      name: "The Meeting House",
      description:
        "Coffee shop, restaurant, and community gathering spot serving craft food, beer, wine, and specialty drinks.",
      hours: [
        { day: "Thursday", hours: "11am – 7pm" },
        { day: "Friday", hours: "11am – 9pm" },
        { day: "Saturday", hours: "11am – 9pm" },
        { day: "Sunday", hours: "11am – 3pm" },
        { day: "Mon–Wed", hours: "Closed" },
      ],
      url: "https://www.themeetinghousecl.com/",
      phone: undefined,
      tags: ["Coffee", "Brunch", "Dinner", "Drinks"],
    },
    {
      name: "Bud's on the Lake",
      description:
        "Lakeside food truck serving burgers, sandwiches, and classic American fare with waterfront views.",
      hours: [
        { day: "Mon–Sat", hours: "11am – 1pm" },
        { day: "Sunday", hours: "Closed" },
      ],
      url: "https://www.yelp.com/biz/buds-on-the-lake-at-carlton-landing-eufaula",
      tags: ["Food Truck", "Burgers", "Lakeside"],
    },
    {
      name: "Mama Tig's",
      description:
        "Popular spot at the corner of Park Street and Water Street known for pizza, fresh salads, and homemade desserts.",
      hours: [
        { day: "Fri–Sat", hours: "11am – 9pm" },
        { day: "Sunday", hours: "11am – 3pm" },
        { day: "Mon–Thu", hours: "Seasonal — check ahead" },
      ],
      tags: ["Pizza", "Salads", "Desserts"],
    },
    {
      name: "The Landing Shack",
      description:
        "Casual lakeside venue with coffee, light bites, and a relaxed atmosphere right on the water.",
      hours: [
        { day: "Seasonal", hours: "Check social media for current hours" },
      ],
      tags: ["Coffee", "Casual", "Lakeside"],
    },
  ];
}

async function fetchRestaurants(): Promise<Restaurant[]> {
  const restaurants = getBaseRestaurants();

  // Try to get updated hours from The Meeting House website
  try {
    const res = await fetch("https://www.themeetinghousecl.com/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const hoursText = $("body").text();

      // Look for hour patterns
      const hourPatterns = hoursText.match(
        /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)[^.;\n]{0,60}(?:am|pm|closed)/gi
      );
      if (hourPatterns && hourPatterns.length > 0) {
        const meetingHouse = restaurants.find(
          (r) => r.name === "The Meeting House"
        );
        if (meetingHouse) {
          meetingHouse.hours = hourPatterns.slice(0, 7).map((h) => {
            const parts = h.split(/[:\u2013\u2014–-]/);
            return {
              day: parts[0]?.trim() || "See website",
              hours: parts.slice(1).join(":").trim() || h.trim(),
            };
          });
        }
      }
    }
  } catch {
    // use defaults
  }

  return restaurants;
}

// ─── Main data fetcher ───

export async function fetchDashboardData(): Promise<DashboardData> {
  const [news, events, restaurants] = await Promise.all([
    fetchNews(),
    fetchEvents(),
    fetchRestaurants(),
  ]);

  return {
    news,
    events,
    restaurants,
    lastUpdated: new Date().toISOString(),
  };
}
