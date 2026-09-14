/**
 * Easy-to-edit configuration for the webstore.
 * Products live in MySQL (database `canopy` by default (or SQLITE_FILE for local)) after first run
 * (seeded from DEFAULT_PRODUCTS). Manage products and photos from /admin.
 *
 * Initialize the database with: npm run db:init  (uses MYSQL_* from .env)
 * Connection credentials: MYSQL_* in .env
 */

// ---------------------------------------------------------------------------
// Store branding
// ---------------------------------------------------------------------------
const STORE_NAME = "Canopy Goods";
const STORE_TAGLINE = "Plants for the quiet greenhouse.";
/** Backup display name Andrew may swap to from admin */
const STORE_NAME_ALT = "Citrus & Fern";

// ---------------------------------------------------------------------------
// Order limits
// ---------------------------------------------------------------------------
/** Maximum confirmed orders allowed per client IP address */
const MAX_ORDERS_PER_IP = 20;

// ---------------------------------------------------------------------------
// Database & server
// ---------------------------------------------------------------------------
/**
 * MySQL connection settings (overridable via .env).
 * Defaults match scripts/init-ocean.sql local development setup.
 *
 * MYSQL_SSL=true enables TLS. Provider cert chains (Aiven and similar) are
 * accepted by default because those CAs are not in the system store.
 * Tighten later with MYSQL_SSL_CA and/or MYSQL_SSL_REJECT_UNAUTHORIZED=true.
 * Local 127.0.0.1 setups usually leave MYSQL_SSL false/off.
 */
function getMysqlConfig() {
  const sslEnabled =
    process.env.MYSQL_SSL === "1" ||
    process.env.MYSQL_SSL === "true" ||
    process.env.MYSQL_SSL === "TRUE";

  let ssl;
  if (sslEnabled) {
    // Default: encrypt, but allow self-signed / private-CA chains.
    // Opt into verification with MYSQL_SSL_REJECT_UNAUTHORIZED=true or a CA file.
    const forceVerify =
      process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "1" ||
      process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "true" ||
      process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "TRUE";
    ssl = {
      rejectUnauthorized: forceVerify,
    };
    if (process.env.MYSQL_SSL_CA) {
      const fs = require("fs");
      ssl.ca = fs.readFileSync(process.env.MYSQL_SSL_CA);
      if (
        process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "0" &&
        process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" &&
        process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "FALSE"
      ) {
        ssl.rejectUnauthorized = true;
      }
    }
  }

  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "ocean",
    password: process.env.MYSQL_PASSWORD || "ocean_pass",
    database: process.env.MYSQL_DATABASE || "ocean",
    ssl,
  };
}

/** HTTP port */
const PORT = process.env.PORT || 3000;

/**
 * Bind address. Use 127.0.0.1 behind nginx on the same machine,
 * or 0.0.0.0 to accept connections from outside the host.
 */
const HOST = process.env.HOST || "0.0.0.0";

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
/**
 * Admin login credentials come from .env — never from the URL.
 *
 *   ADMIN_PASSWORD        plaintext password (hashed with bcrypt at boot)
 *   ADMIN_PASSWORD_HASH   bcrypt hash (preferred; wins if both are set)
 *
 * One of these is required. There is no built-in default password.
 * Generate a hash: npm run admin:hash -- 'your-password'
 */
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "").trim();
const ADMIN_PASSWORD_HASH = String(process.env.ADMIN_PASSWORD_HASH || "").trim();

// ---------------------------------------------------------------------------
// SEO (search engines & social sharing)
// ---------------------------------------------------------------------------
/**
 * Public site origin for canonical URLs, Open Graph, sitemap, and robots.txt.
 * Set SITE_URL in .env to your real production domain (no trailing slash), e.g.:
 *   SITE_URL=https://ocean-market.example.com
 */
const SITE_URL = String(process.env.SITE_URL || `http://127.0.0.1:${PORT}`).replace(
  /\/$/,
  ""
);

/**
 * Central SEO data. Edit `SEO.defaults` for site-wide values and `SEO.pages`
 * for per-route titles, descriptions, and index rules.
 *
 * See README → "SEO" for a full guide.
 */
const SEO = {
  /** Site-wide fallbacks when a page omits a field */
  defaults: {
    title: `${STORE_NAME} — ${STORE_TAGLINE}`,
    description:
      "Shop houseplants, nursery stock, and garden goods at Canopy Goods.",
    keywords:
      "canopy goods, plant shop, nursery, houseplants, garden, citrus, fern",
    /**
     * Default share image (absolute URL or site path starting with /).
     * Leave empty to omit og:image / twitter:image until you add one.
     * Example: "/uploads/products/your-hero.webp"
     * or "https://cdn.example.com/og-ocean-market.jpg"
     */
    image: "",
    robots: "index, follow",
    type: "website",
  },

  /** Optional X/Twitter @handle without the @ (omit twitter:site if empty) */
  twitterSite: "",

  /** Open Graph locale */
  locale: "en_US",

  /**
   * Per-page SEO. Keys match what app.js passes to buildSeo("…").
   *
   * Fields:
   *   title, description, keywords, image, robots, type  — meta tags
   *   path        — used for canonical URL + sitemap (required if sitemap)
   *   sitemap     — set false to exclude from /sitemap.xml (default true if path set)
   *   changefreq  — sitemap hint: always|hourly|daily|weekly|monthly|yearly|never
   *   priority    — sitemap priority 0.0–1.0 as a string
   */
  pages: {
    home: {
      title: `${STORE_NAME} — Inventory`,
      description:
        "Browse houseplants, ferns, citrus, herbs, succulents, and nursery goods at Canopy Goods.",
      keywords:
        "houseplants, nursery, ferns, citrus, herbs, succulents, garden pots",
      path: "/",
      changefreq: "daily",
      priority: "1.0",
    },
    cart: {
      title: `Your Cart — ${STORE_NAME}`,
      description:
        "Review items in your Canopy Goods cart and proceed to checkout.",
      robots: "noindex, follow",
      path: "/cart",
      sitemap: false,
    },
    confirm: {
      title: `Confirm order — ${STORE_NAME}`,
      description: "Confirm your Canopy Goods order and optionally leave contact details.",
      robots: "noindex, nofollow",
      path: "/cart/checkout",
      sitemap: false,
    },
    success: {
      title: `Order placed — ${STORE_NAME}`,
      description: "Your Canopy Goods order was placed successfully.",
      robots: "noindex, nofollow",
      sitemap: false,
    },
    limit: {
      title: `Order limit reached — ${STORE_NAME}`,
      description: "This address has reached the maximum number of orders allowed.",
      robots: "noindex, nofollow",
      sitemap: false,
    },
    notFound: {
      title: `Page not found — ${STORE_NAME}`,
      description: "The page or product you requested could not be found.",
      robots: "noindex, nofollow",
      sitemap: false,
    },
    login: {
      title: `Sign in — ${STORE_NAME}`,
      description: "Sign in to your Canopy Goods account.",
      robots: "noindex, follow",
      path: "/login",
      sitemap: false,
    },
    register: {
      title: `Create account — ${STORE_NAME}`,
      description: "Register for a Canopy Goods account with your email.",
      robots: "noindex, follow",
      path: "/register",
      sitemap: false,
    },
    about: {
      title: `About — ${STORE_NAME}`,
      description: "About Canopy Goods, a plant-forward nursery shop.",
      path: "/about",
      changefreq: "monthly",
      priority: "0.4",
    },
    contact: {
      title: `Contact — ${STORE_NAME}`,
      description: "Contact Canopy Goods.",
      path: "/contact",
      changefreq: "monthly",
      priority: "0.4",
    },
    shipping: {
      title: `Shipping — ${STORE_NAME}`,
      description: "Shipping details for Canopy Goods plant orders.",
      path: "/shipping",
      changefreq: "monthly",
      priority: "0.3",
    },
    returns: {
      title: `Returns — ${STORE_NAME}`,
      description: "Returns and plant guarantee for Canopy Goods.",
      path: "/returns",
      changefreq: "monthly",
      priority: "0.3",
    },
    care: {
      title: `Care guides — ${STORE_NAME}`,
      description: "Care guides for houseplants, ferns, citrus, and herbs.",
      path: "/care",
      changefreq: "weekly",
      priority: "0.5",
    },
    admin: {
      title: `Admin — ${STORE_NAME}`,
      description: "Canopy Goods administration.",
      robots: "noindex, nofollow",
      sitemap: false,
    },
  },
};

/**
 * Resolve an image path to an absolute URL for Open Graph / Twitter cards.
 * Accepts full http(s) URLs or site-relative paths (/…).
 */
function absoluteUrl(urlOrPath) {
  if (!urlOrPath) return "";
  const s = String(urlOrPath).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  const pathPart = s.startsWith("/") ? s : `/${s}`;
  return `${SITE_URL}${pathPart}`;
}

/**
 * Build the SEO object passed to EJS templates (and used by the layout head).
 *
 * @param {string} [pageKey] - Key under SEO.pages (e.g. "home", "cart")
 * @param {object} [overrides] - Optional per-request overrides (title, description, …)
 * @returns {object} Flat SEO fields for the layout
 */
function buildSeo(pageKey, overrides = {}) {
  const page = (pageKey && SEO.pages[pageKey]) || {};
  const d = SEO.defaults;
  const o = overrides || {};

  const title = o.title || page.title || d.title;
  const description = o.description || page.description || d.description;
  const keywords = o.keywords || page.keywords || d.keywords;
  const robots = o.robots || page.robots || d.robots;
  const type = o.type || page.type || d.type;
  const pathPart = o.path || page.path || "";
  const imageRaw = o.image || page.image || d.image || "";

  return {
    title,
    description,
    keywords,
    robots,
    type,
    locale: SEO.locale,
    siteName: STORE_NAME,
    siteUrl: SITE_URL,
    path: pathPart,
    canonical: pathPart ? absoluteUrl(pathPart) : SITE_URL,
    image: absoluteUrl(imageRaw),
    twitterSite: SEO.twitterSite || "",
    twitterCard: imageRaw ? "summary_large_image" : "summary",
  };
}

/**
 * Entries for /sitemap.xml — only pages with a path and sitemap !== false.
 */
function getSitemapEntries() {
  return Object.values(SEO.pages)
    .filter((p) => p && p.path && p.sitemap !== false)
    .map((p) => ({
      loc: absoluteUrl(p.path),
      changefreq: p.changefreq || "weekly",
      priority: p.priority || "0.5",
    }));
}

// ---------------------------------------------------------------------------
// Default products (seeded into the DB once if the products table is empty)
// ---------------------------------------------------------------------------
const DEFAULT_PRODUCTS = [
  {
    id: "monstera-deliciosa",
    name: "Monstera Deliciosa",
    price: 28.0,
    description: "Fenestrated leaves for a bright corner. Let the soil dry a bit between drinks.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "fiddle-leaf-fig",
    name: "Fiddle Leaf Fig",
    price: 42.0,
    description: "Tall, glossy, a little dramatic. Steady light and no cold drafts.",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "snake-plant",
    name: "Snake Plant",
    price: 18.0,
    description: "Nearly unkillable upright leaves. Perfect for low light and busy weeks.",
    image: "https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "pothos-golden",
    name: "Golden Pothos",
    price: 14.0,
    description: "Trailing vines that forgive missed waterings. Hang it or let it climb.",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "calathea-orbifolia",
    name: "Calathea Orbifolia",
    price: 32.0,
    description: "Broad striped leaves that like humidity. Keep the soil evenly moist.",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "zz-plant",
    name: "ZZ Plant",
    price: 22.0,
    description: "Glossy rhizomes for shady rooms. Water sparingly — it stores what it needs.",
    image: "https://images.unsplash.com/photo-1632207691143-643e208c3e3f?w=900&h=700&fit=crop",
    category: "Houseplants",
  },
  {
    id: "boston-fern",
    name: "Boston Fern",
    price: 16.0,
    description: "Soft fronds for a bathroom or shaded porch. Loves a mist now and then.",
    image: "https://images.unsplash.com/photo-1519331379825-fcdbba9c0f3f?w=900&h=700&fit=crop",
    category: "Ferns",
  },
  {
    id: "bird-nest-fern",
    name: "Bird's Nest Fern",
    price: 19.0,
    description: "Wavy apple-green fronds from a central nest. Keep the crown dry.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&h=700&fit=crop",
    category: "Ferns",
  },
  {
    id: "maidenhair-fern",
    name: "Maidenhair Fern",
    price: 15.0,
    description: "Delicate black stems and soft leaflets. Humidity is the whole game.",
    image: "https://images.unsplash.com/photo-1463936570159-275e0325b29a?w=900&h=700&fit=crop",
    category: "Ferns",
  },
  {
    id: "meyer-lemon",
    name: "Meyer Lemon Tree",
    price: 48.0,
    description: "Fragrant blossoms and edible fruit for a sunny greenhouse window.",
    image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=900&h=700&fit=crop",
    category: "Citrus",
  },
  {
    id: "calamondin",
    name: "Calamondin Orange",
    price: 36.0,
    description: "Compact citrus with tart little oranges. Bright light and good drainage.",
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=900&h=700&fit=crop",
    category: "Citrus",
  },
  {
    id: "key-lime",
    name: "Key Lime",
    price: 34.0,
    description: "Small fragrant limes for patio pots. Protect from hard freezes.",
    image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=900&h=700&fit=crop",
    category: "Citrus",
  },
  {
    id: "lavender-hidcote",
    name: "Lavender 'Hidcote'",
    price: 12.0,
    description: "Compact purple spikes for full sun and lean soil. Trim after bloom.",
    image: "https://images.unsplash.com/photo-1499002238440-d647969e5f5c?w=900&h=700&fit=crop",
    category: "Herbs",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    price: 10.0,
    description: "Needle foliage and kitchen aroma. Dry feet, bright light.",
    image: "https://images.unsplash.com/photo-1515586000433-2421c4c0ae1c?w=900&h=700&fit=crop",
    category: "Herbs",
  },
  {
    id: "basil-genovese",
    name: "Genovese Basil",
    price: 6.0,
    description: "Soft leaves for pesto season. Pinch tips to keep it bushy.",
    image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=900&h=700&fit=crop",
    category: "Herbs",
  },
  {
    id: "jade-plant",
    name: "Jade Plant",
    price: 14.0,
    description: "Thick leaves that bank water for later. Bright light, sparse drinks.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&h=700&fit=crop",
    category: "Succulents",
  },
  {
    id: "echeveria",
    name: "Echeveria Rosette",
    price: 9.0,
    description: "Tight pastel rosette for a sunny sill. Gravelly mix, little water.",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=900&h=700&fit=crop",
    category: "Succulents",
  },
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    price: 11.0,
    description: "Useful gel in the leaves. Bright light and a dry rest between waterings.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&h=700&fit=crop",
    category: "Succulents",
  },
  {
    id: "terracotta-6in",
    name: "6\" Terracotta Pot",
    price: 8.0,
    description: "Breathable clay for plants that hate wet feet. Saucer sold separate.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d1d17dff?w=900&h=700&fit=crop",
    category: "Pots & Tools",
  },
  {
    id: "potting-mix",
    name: "All-Purpose Potting Mix (8 qt)",
    price: 12.0,
    description: "Light, draining mix for houseplants and herbs. Ready to pot.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=700&fit=crop",
    category: "Pots & Tools",
  },
  {
    id: "pruning-snips",
    name: "Pruning Snips",
    price: 15.0,
    description: "Sharp bypass snips for clean cuts on stems and spent blooms.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=700&fit=crop",
    category: "Pots & Tools",
  },
];

/** Fallback image when a new product is added without a photo */
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=900&h=700&fit=crop";

/** Format a price for display, e.g. 18 → "18.00" */
function formatPrice(price) {
  return Number(price).toFixed(2);
}

/**
 * Build a URL-safe product id from a name.
 * Example: "Wave Ceramic Mug" → "wave-ceramic-mug"
 */
function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

module.exports = {
  STORE_NAME,
  STORE_NAME_ALT,
  STORE_TAGLINE,
  MAX_ORDERS_PER_IP,
  getMysqlConfig,
  PORT,
  HOST,
  ADMIN_PASSWORD,
  ADMIN_PASSWORD_HASH,
  SITE_URL,
  SEO,
  buildSeo,
  getSitemapEntries,
  absoluteUrl,
  DEFAULT_PRODUCTS,
  PLACEHOLDER_IMAGE,
  formatPrice,
  slugify,
};
