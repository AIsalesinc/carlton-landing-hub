import * as cheerio from "cheerio";
import type {
  NewsItem,
  EventItem,
  Restaurant,
  Activity,
  RentalListing,
  RentalStats,
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

function emptyStats(platform: string): RentalStats {
  return { platform, totalListings: 0, avgPrice: null, minPrice: null, maxPrice: null, listings: [] };
}

async function fetchAirbnbData(): Promise<RentalStats> {
  try {
    // Airbnb search page embeds listing data in script tags
    const searchUrl =
      "https://www.airbnb.com/s/Carlton-Landing--OK--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes";
    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return emptyStats("Airbnb");
    const html = await res.text();

    const listings: RentalListing[] = [];

    // Strategy 1: Parse __NEXT_DATA__ JSON embedded in the page
    const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        // Navigate the nested structure to find listing data
        const searchResults =
          nextData?.props?.pageProps?.bootstrapData?.reduxData?.exploreTab?.sections ||
          nextData?.props?.pageProps?.searchResults ||
          [];

        const extractListings = (obj: Record<string, unknown>): void => {
          if (!obj || typeof obj !== "object") return;
          // Look for listing-like objects with price info
          if (
            "listing" in obj &&
            typeof (obj as Record<string, unknown>).listing === "object"
          ) {
            const listing = obj.listing as Record<string, unknown>;
            const pricingQuote = (obj as Record<string, unknown>).pricingQuote as Record<string, unknown> | undefined;
            const price = pricingQuote
              ? ((pricingQuote.price as Record<string, unknown>)?.amount as number) ||
                ((pricingQuote.structuredStayDisplayPrice as Record<string, unknown>)?.primaryLine as Record<string, unknown>)?.price as number ||
                null
              : null;

            listings.push({
              name: (listing.name as string) || (listing.title as string) || "Carlton Landing Property",
              price: typeof price === "number" ? Math.round(price) : null,
              url: listing.id
                ? `https://www.airbnb.com/rooms/${listing.id}`
                : "https://www.airbnb.com/s/Carlton-Landing--OK/homes",
              platform: "airbnb",
              rating: typeof listing.avgRating === "number" ? listing.avgRating : undefined,
              reviews: typeof listing.reviewsCount === "number" ? listing.reviewsCount : undefined,
              bedrooms: typeof listing.bedrooms === "number" ? listing.bedrooms : undefined,
              guests: typeof listing.personCapacity === "number" ? listing.personCapacity : undefined,
            });
          }
          // Recurse
          for (const val of Object.values(obj)) {
            if (val && typeof val === "object") {
              if (Array.isArray(val)) {
                val.forEach((item) => {
                  if (item && typeof item === "object") extractListings(item as Record<string, unknown>);
                });
              } else {
                extractListings(val as Record<string, unknown>);
              }
            }
          }
        };

        if (Array.isArray(searchResults)) {
          searchResults.forEach((section: Record<string, unknown>) => extractListings(section));
        } else {
          extractListings(nextData.props?.pageProps || {});
        }
      } catch {
        // JSON parse failed, continue to fallback
      }
    }

    // Strategy 2: Try to find price patterns in HTML with cheerio
    if (listings.length === 0) {
      const $ = cheerio.load(html);

      // Airbnb often shows prices in specific patterns
      const priceRegex = /\$(\d{2,4})\s*(?:\/?\s*night|per\s*night|nightly)/gi;
      const bodyText = $("body").text();
      const priceMatches = [...bodyText.matchAll(priceRegex)];
      const prices = priceMatches.map((m) => parseInt(m[1], 10)).filter((p) => p > 50 && p < 5000);

      // Count listing cards
      const cardCount = $("[itemprop='itemListElement'], [data-testid='card-container'], .c4mnd7m, .g1qv1ctd, .cy5jw6o").length;

      if (prices.length > 0 || cardCount > 0) {
        const count = Math.max(prices.length, cardCount, 1);
        for (let i = 0; i < count && i < 20; i++) {
          listings.push({
            name: `Carlton Landing Property ${i + 1}`,
            price: prices[i] || null,
            url: "https://www.airbnb.com/s/Carlton-Landing--OK/homes",
            platform: "airbnb",
          });
        }
      }
    }

    // Strategy 3: Look for JSON-LD structured data
    if (listings.length === 0) {
      const $ = cheerio.load(html);
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const ld = JSON.parse($(el).html() || "{}");
          if (ld["@type"] === "ItemList" && Array.isArray(ld.itemListElement)) {
            ld.itemListElement.forEach((item: Record<string, unknown>) => {
              listings.push({
                name: (item.name as string) || "Carlton Landing Property",
                price: null,
                url: (item.url as string) || "https://www.airbnb.com/s/Carlton-Landing--OK/homes",
                platform: "airbnb",
              });
            });
          }
        } catch {
          // skip
        }
      });
    }

    const prices = listings.map((l) => l.price).filter((p): p is number => p !== null && p > 0);
    return {
      platform: "Airbnb",
      totalListings: listings.length,
      avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      listings: listings.slice(0, 20),
    };
  } catch {
    return emptyStats("Airbnb");
  }
}

async function fetchVrboData(): Promise<RentalStats> {
  try {
    const searchUrl =
      "https://www.vrbo.com/vacation-rentals/usa/oklahoma/carlton-landing";
    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return emptyStats("VRBO");
    const html = await res.text();
    const $ = cheerio.load(html);
    const listings: RentalListing[] = [];

    // VRBO embeds property data in script tags or __NEXT_DATA__
    const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const data = JSON.parse(nextDataMatch[1]);
        const extractVrbo = (obj: Record<string, unknown>): void => {
          if (!obj || typeof obj !== "object") return;
          // VRBO listings typically have propertyId and headline
          if ("propertyId" in obj || "headline" in obj) {
            const price =
              (((obj as Record<string, unknown>).price as Record<string, unknown>)?.lead as Record<string, unknown>)?.amount as number ||
              ((obj as Record<string, unknown>).averagePrice as Record<string, unknown>)?.amount as number ||
              null;
            const name = (obj.headline as string) || (obj.name as string) || "Carlton Landing Rental";
            if (name.length > 2) {
              listings.push({
                name: name.slice(0, 80),
                price: typeof price === "number" ? Math.round(price) : null,
                url: obj.propertyId
                  ? `https://www.vrbo.com/${obj.propertyId}ha`
                  : searchUrl,
                platform: "vrbo",
                rating: typeof obj.averageRating === "number" ? obj.averageRating : undefined,
                reviews: typeof obj.reviewCount === "number" ? obj.reviewCount : undefined,
                bedrooms: typeof obj.bedrooms === "number" ? obj.bedrooms : undefined,
                guests: typeof obj.sleeps === "number" ? obj.sleeps : undefined,
              });
            }
          }
          for (const val of Object.values(obj)) {
            if (val && typeof val === "object") {
              if (Array.isArray(val)) {
                val.forEach((item) => {
                  if (item && typeof item === "object") extractVrbo(item as Record<string, unknown>);
                });
              } else {
                extractVrbo(val as Record<string, unknown>);
              }
            }
          }
        };
        extractVrbo(data);
      } catch {
        // continue to fallback
      }
    }

    // Fallback: parse visible price text
    if (listings.length === 0) {
      const priceRegex = /\$(\d{2,4})\s*(?:\/?\s*(?:night|avg))/gi;
      const bodyText = $("body").text();
      const priceMatches = [...bodyText.matchAll(priceRegex)];
      const prices = priceMatches.map((m) => parseInt(m[1], 10)).filter((p) => p > 50 && p < 5000);

      // Try to get total listing count from page text
      const countMatch = bodyText.match(/(\d{1,4})\s*(?:properties|results|rentals|vacation)/i);
      const totalFromPage = countMatch ? parseInt(countMatch[1], 10) : 0;

      const count = Math.max(prices.length, 1);
      for (let i = 0; i < count && i < 20; i++) {
        listings.push({
          name: `Carlton Landing Rental ${i + 1}`,
          price: prices[i] || null,
          url: searchUrl,
          platform: "vrbo",
        });
      }

      if (totalFromPage > listings.length) {
        // We know there are more listings than we parsed prices for
        const prices2 = listings.map((l) => l.price).filter((p): p is number => p !== null);
        return {
          platform: "VRBO",
          totalListings: totalFromPage,
          avgPrice: prices2.length > 0 ? Math.round(prices2.reduce((a, b) => a + b, 0) / prices2.length) : null,
          minPrice: prices2.length > 0 ? Math.min(...prices2) : null,
          maxPrice: prices2.length > 0 ? Math.max(...prices2) : null,
          listings,
        };
      }
    }

    // Deduplicate by name
    const seen = new Set<string>();
    const dedupedListings = listings.filter((l) => {
      const key = l.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const prices = dedupedListings.map((l) => l.price).filter((p): p is number => p !== null && p > 0);
    return {
      platform: "VRBO",
      totalListings: dedupedListings.length,
      avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      listings: dedupedListings.slice(0, 20),
    };
  } catch {
    return emptyStats("VRBO");
  }
}

async function fetchOccupancy(): Promise<OccupancyData> {
  const [airbnb, vrbo] = await Promise.all([fetchAirbnbData(), fetchVrboData()]);
  return { airbnb, vrbo, lastChecked: new Date().toISOString() };
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
