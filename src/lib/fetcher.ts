import * as cheerio from "cheerio";
import type {
  NewsItem,
  EventItem,
  Restaurant,
  Activity,
  RentalListing,
  DateSnapshot,
  PlatformOccupancy,
  OccupancyData,
  DashboardData,
} from "./types";

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

// ─── Activities: scrape additional sources ───

async function fetchActivities(): Promise<Activity[]> {
  const activities: Activity[] = [];

  // Lake Days / Aqua Park
  try {
    const res = await fetch("https://lakedayscl.com/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // Try multiple selectors for content blocks
      $("section, .service, .activity, article, .block, [class*='card'], [class*='feature']")
        .each((_, el) => {
          const title = $(el).find("h2, h3, h4").first().text().trim();
          const desc = $(el).find("p").first().text().trim();
          const link = $(el).find("a").first().attr("href") || "";
          if (title && title.length > 3 && title.length < 100) {
            activities.push({
              name: title,
              description: desc.slice(0, 200) || "Visit lakedayscl.com for details.",
              url: link.startsWith("http") ? link : `https://lakedayscl.com${link}`,
              source: "Lake Days Aqua Park",
              tags: ["Water Sports", "Family"],
            });
          }
        });

      // Fallback: if no structured content, add a default entry
      if (!activities.some((a) => a.source === "Lake Days Aqua Park")) {
        const bodyText = $("body").text().toLowerCase();
        const hasBooking = bodyText.includes("book") || bodyText.includes("session") || bodyText.includes("reserve");
        activities.push({
          name: "Lake Days Aqua Park",
          description: hasBooking
            ? "Oklahoma's largest inflatable aqua playground. 60-min sessions, must reserve in advance. Ages 7+, 45in+ height."
            : "Oklahoma's largest inflatable aqua playground on Lake Eufaula. Visit website for hours and reservations.",
          url: "https://lakedayscl.com/",
          source: "Lake Days Aqua Park",
          tags: ["Water Sports", "Family", "Reservations Required"],
        });
      }
    }
  } catch {
    activities.push({
      name: "Lake Days Aqua Park",
      description: "Oklahoma's largest inflatable aqua playground on Lake Eufaula. 60-min sessions, reservations required. Ages 7+.",
      url: "https://lakedayscl.com/",
      source: "Lake Days Aqua Park",
      tags: ["Water Sports", "Family", "Reservations Required"],
    });
  }

  // LakeStay Area Guide
  try {
    const res = await fetch("https://thelakestay.com/area-guide/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $("section, article, .activity, .attraction, [class*='card'], [class*='guide'], .wp-block-group, .entry-content h2, .entry-content h3")
        .each((_, el) => {
          const isHeading = $(el).is("h2, h3");
          const title = isHeading
            ? $(el).text().trim()
            : $(el).find("h2, h3, h4").first().text().trim();
          const desc = isHeading
            ? $(el).nextAll("p").first().text().trim()
            : $(el).find("p").first().text().trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 3 && title.length < 100) {
            activities.push({
              name: title,
              description: desc.slice(0, 200) || "See thelakestay.com for details.",
              url: link.startsWith("http") ? link : "https://thelakestay.com/area-guide/",
              source: "LakeStay Guide",
              tags: ["Local Attraction"],
            });
          }
        });
    }
  } catch {
    // silently continue
  }

  // Carlton Landing Events & Tours
  try {
    const res = await fetch("https://www.carltonlandingevents.com/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $("section, article, .event, .tour, [class*='card'], [class*='service'], [class*='item'], .sqs-block-content")
        .each((_, el) => {
          const title = $(el).find("h2, h3, h4").first().text().trim();
          const desc = $(el).find("p").first().text().trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 3 && title.length < 100) {
            activities.push({
              name: title,
              description: desc.slice(0, 200) || "See carltonlandingevents.com for details.",
              url: link.startsWith("http") ? link : `https://www.carltonlandingevents.com${link}`,
              source: "CL Events & Tours",
              tags: ["Events", "Tours"],
            });
          }
        });
    }
  } catch {
    // silently continue
  }

  // Carlton Landing Foundation Calendar
  try {
    const res = await fetch("https://carltonlandingfoundation.org/calendar/", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      $(".tribe-events-calendar-list__event, .type-tribe_events, .tribe-common-g-row, article.tribe-events-calendar-month__calendar-event")
        .each((_, el) => {
          const title = $(el)
            .find("h2, h3, .tribe-events-calendar-list__event-title, .tribe-events-calendar-month__calendar-event-title")
            .first()
            .text()
            .trim();
          const date = $(el)
            .find("time, .tribe-events-calendar-list__event-datetime")
            .first()
            .text()
            .trim();
          const link = $(el).find("a").first().attr("href") || "";

          if (title && title.length > 2) {
            activities.push({
              name: title,
              description: date ? `${date}` : "See Foundation calendar for details.",
              url: link.startsWith("http") ? link : `https://carltonlandingfoundation.org${link}`,
              source: "CL Foundation",
              tags: ["Community Event"],
            });
          }
        });
    }
  } catch {
    // silently continue
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return activities.filter((a) => {
    const key = a.name.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 15);
}

// ─── Rental Occupancy & Pricing: Airbnb + VRBO ───

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Generate upcoming Fri→Sun date ranges for the next ~6 weekends */
function getUpcomingWeekends(count = 6): { label: string; checkIn: string; checkOut: string }[] {
  const ranges: { label: string; checkIn: string; checkOut: string }[] = [];
  const now = new Date();
  // Start from tomorrow to avoid stale "today" results
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Advance to next Friday
  while (cursor.getDay() !== 5) cursor.setDate(cursor.getDate() + 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const shortMonth = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  for (let i = 0; i < count; i++) {
    const fri = new Date(cursor);
    const sun = new Date(cursor);
    sun.setDate(sun.getDate() + 2);
    ranges.push({
      label: i === 0 ? "This Weekend" : `${shortMonth(fri)}–${sun.getDate()}`,
      checkIn: fmt(fri),
      checkOut: fmt(sun),
    });
    cursor.setDate(cursor.getDate() + 7);
  }
  return ranges;
}

/** Deep-search a JSON tree for listing / price objects */
function extractListingsFromJson(
  obj: unknown,
  platform: "airbnb" | "vrbo",
  fallbackUrl: string,
): RentalListing[] {
  const listings: RentalListing[] = [];
  const seen = new Set<string>();

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;

    // ── Airbnb shape ──
    if (platform === "airbnb" && "listing" in rec && typeof rec.listing === "object") {
      const listing = rec.listing as Record<string, unknown>;
      const pq = rec.pricingQuote as Record<string, unknown> | undefined;
      let price: number | null = null;
      if (pq) {
        const amt = (pq.price as Record<string, unknown>)?.amount;
        const structured = (
          (pq.structuredStayDisplayPrice as Record<string, unknown>)?.primaryLine as Record<string, unknown>
        )?.price;
        price = typeof amt === "number" ? amt : typeof structured === "number" ? structured : null;
      }
      const id = String(listing.id || "");
      if (id && !seen.has(id)) {
        seen.add(id);
        listings.push({
          name: (listing.name as string) || (listing.title as string) || "Carlton Landing Property",
          price: typeof price === "number" ? Math.round(price) : null,
          url: id ? `https://www.airbnb.com/rooms/${id}` : fallbackUrl,
          platform: "airbnb",
          rating: typeof listing.avgRating === "number" ? listing.avgRating : undefined,
          reviews: typeof listing.reviewsCount === "number" ? listing.reviewsCount : undefined,
          bedrooms: typeof listing.bedrooms === "number" ? listing.bedrooms : undefined,
          guests: typeof listing.personCapacity === "number" ? listing.personCapacity : undefined,
        });
      }
    }

    // ── VRBO shape ──
    if (platform === "vrbo" && ("propertyId" in rec || "headline" in rec)) {
      const priceLead = ((rec.price as Record<string, unknown>)?.lead as Record<string, unknown>)?.amount;
      const priceAvg = (rec.averagePrice as Record<string, unknown>)?.amount;
      const price = typeof priceLead === "number" ? priceLead : typeof priceAvg === "number" ? priceAvg : null;
      const name = (rec.headline as string) || (rec.name as string) || "";
      const pid = String(rec.propertyId || name);
      if (name.length > 2 && !seen.has(pid)) {
        seen.add(pid);
        listings.push({
          name: name.slice(0, 80),
          price: typeof price === "number" ? Math.round(price) : null,
          url: rec.propertyId ? `https://www.vrbo.com/${rec.propertyId}ha` : fallbackUrl,
          platform: "vrbo",
          rating: typeof rec.averageRating === "number" ? rec.averageRating : undefined,
          reviews: typeof rec.reviewCount === "number" ? rec.reviewCount : undefined,
          bedrooms: typeof rec.bedrooms === "number" ? rec.bedrooms : undefined,
          guests: typeof rec.sleeps === "number" ? rec.sleeps : undefined,
        });
      }
    }

    // Recurse
    for (const val of Object.values(rec)) {
      if (Array.isArray(val)) val.forEach(walk);
      else if (val && typeof val === "object") walk(val);
    }
  }

  walk(obj);
  return listings;
}

/** Parse prices from raw page text as a fallback */
function parsePricesFromText(text: string): number[] {
  const regex = /\$(\d{2,4})\s*(?:\/?\s*(?:night|avg|nightly|per\s*night))/gi;
  return [...text.matchAll(regex)]
    .map((m) => parseInt(m[1], 10))
    .filter((p) => p > 50 && p < 5000);
}

/** Parse listing count from page text */
function parseListingCount(text: string): number {
  const m = text.match(/(\d{1,4})\s*(?:properties|results|rentals|vacation|homes|places)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Fetch a single Airbnb search (with optional dates) and return listings */
async function fetchAirbnbSearch(
  checkIn?: string,
  checkOut?: string,
): Promise<RentalListing[]> {
  let url = "https://www.airbnb.com/s/Carlton-Landing--OK--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes";
  if (checkIn && checkOut) {
    url += `&checkin=${checkIn}&checkout=${checkOut}`;
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) return [];
  const html = await res.text();

  // Try __NEXT_DATA__ embedded JSON
  const m = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      const listings = extractListingsFromJson(data, "airbnb", url);
      if (listings.length > 0) return listings;
    } catch { /* fall through */ }
  }

  // Try JSON-LD
  const $ = cheerio.load(html);
  const ldListings: RentalListing[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const ld = JSON.parse($(el).html() || "{}");
      if (ld["@type"] === "ItemList" && Array.isArray(ld.itemListElement)) {
        ld.itemListElement.forEach((item: Record<string, unknown>) => {
          ldListings.push({
            name: (item.name as string) || "Carlton Landing Property",
            price: null,
            url: (item.url as string) || url,
            platform: "airbnb",
          });
        });
      }
    } catch { /* skip */ }
  });
  if (ldListings.length > 0) return ldListings;

  // Fallback: price text
  const bodyText = $("body").text();
  const prices = parsePricesFromText(bodyText);
  const cardCount = $("[itemprop='itemListElement'], [data-testid='card-container']").length;
  const count = Math.max(prices.length, cardCount);
  if (count > 0) {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      name: `Carlton Landing Property ${i + 1}`,
      price: prices[i] || null,
      url,
      platform: "airbnb" as const,
    }));
  }

  // Last resort: try listing count from text
  const textCount = parseListingCount(bodyText);
  if (textCount > 0) {
    return Array.from({ length: Math.min(textCount, 20) }, (_, i) => ({
      name: `Carlton Landing Property ${i + 1}`,
      price: prices[i] || null,
      url,
      platform: "airbnb" as const,
    }));
  }

  return [];
}

/** Fetch a single VRBO search (with optional dates) and return listings */
async function fetchVrboSearch(
  checkIn?: string,
  checkOut?: string,
): Promise<RentalListing[]> {
  let url = "https://www.vrbo.com/vacation-rentals/usa/oklahoma/carlton-landing";
  if (checkIn && checkOut) {
    url += `?startDate=${checkIn}&endDate=${checkOut}`;
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);

  // Try __NEXT_DATA__
  const m = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      const listings = extractListingsFromJson(data, "vrbo", url);
      if (listings.length > 0) return listings;
    } catch { /* fall through */ }
  }

  // Fallback: price text + count
  const bodyText = $("body").text();
  const prices = parsePricesFromText(bodyText);
  const textCount = parseListingCount(bodyText);
  const count = Math.max(prices.length, textCount, 0);
  if (count > 0) {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      name: `Carlton Landing Rental ${i + 1}`,
      price: prices[i] || null,
      url,
      platform: "vrbo" as const,
    }));
  }

  return [];
}

function buildPlatformOccupancy(
  platform: string,
  baselineListings: RentalListing[],
  weekendResults: { range: { label: string; checkIn: string; checkOut: string }; listings: RentalListing[] }[],
): PlatformOccupancy {
  const total = baselineListings.length;
  const basePrices = baselineListings.map((l) => l.price).filter((p): p is number => p !== null && p > 0);
  const baselineAvg = basePrices.length > 0 ? Math.round(basePrices.reduce((a, b) => a + b, 0) / basePrices.length) : null;

  const snapshots: DateSnapshot[] = weekendResults.map(({ range, listings }) => {
    const prices = listings.map((l) => l.price).filter((p): p is number => p !== null && p > 0);
    return {
      label: range.label,
      checkIn: range.checkIn,
      checkOut: range.checkOut,
      availableListings: listings.length,
      avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
    };
  });

  return {
    platform,
    totalListings: total,
    baselineAvgPrice: baselineAvg,
    snapshots,
    listings: baselineListings.slice(0, 12),
  };
}

async function fetchOccupancy(): Promise<OccupancyData> {
  const weekends = getUpcomingWeekends(6);

  // Fetch baseline (no dates = all listings) for both platforms
  const [airbnbBase, vrboBase] = await Promise.all([
    fetchAirbnbSearch().catch(() => [] as RentalListing[]),
    fetchVrboSearch().catch(() => [] as RentalListing[]),
  ]);

  // Fetch each weekend in parallel for both platforms
  const airbnbWeekendPromises = weekends.map((w) =>
    fetchAirbnbSearch(w.checkIn, w.checkOut)
      .catch(() => [] as RentalListing[])
      .then((listings) => ({ range: w, listings })),
  );
  const vrboWeekendPromises = weekends.map((w) =>
    fetchVrboSearch(w.checkIn, w.checkOut)
      .catch(() => [] as RentalListing[])
      .then((listings) => ({ range: w, listings })),
  );

  const [airbnbWeekends, vrboWeekends] = await Promise.all([
    Promise.all(airbnbWeekendPromises),
    Promise.all(vrboWeekendPromises),
  ]);

  return {
    airbnb: buildPlatformOccupancy("Airbnb", airbnbBase, airbnbWeekends),
    vrbo: buildPlatformOccupancy("VRBO", vrboBase, vrboWeekends),
    lastChecked: new Date().toISOString(),
  };
}

// ─── Main data fetcher ───

export async function fetchDashboardData(): Promise<DashboardData> {
  const [news, events, restaurants, activities, occupancy] = await Promise.all([
    fetchNews(),
    fetchEvents(),
    fetchRestaurants(),
    fetchActivities(),
    fetchOccupancy(),
  ]);

  return {
    news,
    events,
    restaurants,
    activities,
    occupancy,
    lastUpdated: new Date().toISOString(),
  };
}
