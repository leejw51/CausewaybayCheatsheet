/**
 * Static-site generator: turns every .html file in html/ into a book on the shelf.
 *
 * Drop a new .html into html/ and re-run `make` — the book appears automatically.
 * Optional per-book metadata (shelf, blurb, author) lives in books.config.json;
 * books without an entry land on the "New Arrivals" shelf with derived metadata.
 */
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderIndex } from "./template.js";
import { LOCALES, type Localized } from "./i18n.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HTML_DIR = path.join(ROOT, "html");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");
const CONFIG_PATH = path.join(ROOT, "books.config.json");

export interface SpineLook {
  color: string;
  foil: string;
  height: number; // px
  width: number; // px
  lean: number; // deg
}

export interface Book {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  /** Absent → the locale's "House edition" label. */
  author?: Localized;
  blurb: Localized;
  shelf: string;
  minutes: number;
  spine: SpineLook;
}

export interface ShopConfig {
  shopName: string;
  shopNameCzech: string;
  tagline: string;
  shelfOrder: string[];
  books: Record<
    string,
    { shelf?: string; blurb?: Localized; author?: Localized; title?: string; subtitle?: string }
  >;
}

const DEFAULT_SHELF = "New Arrivals";

// Aged-leather bindings; foil is the lettering color stamped on that leather.
const LEATHERS: Array<{ color: string; foil: string }> = [
  { color: "#6B2A24", foil: "#E4C685" }, // oxblood
  { color: "#2F4A3B", foil: "#DCC488" }, // bottle green
  { color: "#2C3B58", foil: "#D9BF8C" }, // prussian blue
  { color: "#533A1E", foil: "#EAD397" }, // umber
  { color: "#592532", foil: "#DFC186" }, // mulberry
  { color: "#1E4740", foil: "#D6C08B" }, // viridian
  { color: "#4A2E14", foil: "#E6CB8F" }, // saddle brown
  { color: "#3A3550", foil: "#D8BE8A" }, // dusk violet
];

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Deterministic binding per slug, so the shelf looks hand-stocked but stable across builds. */
function spineFor(slug: string): SpineLook {
  const h = fnv1a(slug);
  const leather = LEATHERS[h % LEATHERS.length];
  return {
    ...leather,
    height: 234 + (Math.floor(h / 7) % 42), // 234–275px
    width: 54 + (Math.floor(h / 13) % 18), // 54–71px
    lean: ((Math.floor(h / 31) % 5) - 2) * 0.4, // -0.8–0.8deg
  };
}

function extractTitle(html: string, slug: string): { title: string; subtitle: string } {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  const raw = (match?.[1] ?? slug.replace(/[-_]/g, " ")).trim();
  const [title, ...rest] = raw.split(/\s+[—–]\s+/);
  return { title: title.trim(), subtitle: rest.join(" — ").trim() };
}

function readingMinutes(html: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 220));
}

async function loadConfig(): Promise<ShopConfig> {
  const fallback: ShopConfig = {
    shopName: "Causewaybay Books",
    shopNameCzech: "Knihkupectví u Mostu",
    tagline: "Interactive little books, kept the old way.",
    shelfOrder: [],
    books: {},
  };
  if (!existsSync(CONFIG_PATH)) return fallback;
  const parsed = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  return { ...fallback, ...parsed };
}

async function collectBooks(config: ShopConfig): Promise<Book[]> {
  const entries = await readdir(HTML_DIR);
  const files = entries.filter((f) => f.toLowerCase().endsWith(".html")).sort();
  const books: Book[] = [];
  for (const file of files) {
    const slug = file.replace(/\.html$/i, "");
    const html = await readFile(path.join(HTML_DIR, file), "utf8");
    const derived = extractTitle(html, slug);
    const meta = config.books[slug] ?? {};
    books.push({
      slug,
      href: `books/${file}`,
      title: meta.title ?? derived.title,
      subtitle: meta.subtitle ?? derived.subtitle,
      author: meta.author,
      blurb: meta.blurb ?? derived.subtitle ?? "An interactive volume from the Causewaybay press.",
      shelf: meta.shelf ?? DEFAULT_SHELF,
      minutes: readingMinutes(html),
      spine: spineFor(slug),
    });
  }
  return books;
}

function groupByShelf(books: Book[], order: string[]): Array<{ name: string; books: Book[] }> {
  const groups = new Map<string, Book[]>();
  for (const book of books) {
    const list = groups.get(book.shelf) ?? [];
    list.push(book);
    groups.set(book.shelf, list);
  }
  const rank = (name: string) => {
    const i = order.indexOf(name);
    if (i !== -1) return i;
    return name === DEFAULT_SHELF ? order.length + 1 : order.length;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([name, list]) => ({ name, books: list }));
}

async function main() {
  const config = await loadConfig();
  const books = await collectBooks(config);
  const shelves = groupByShelf(books, config.shelfOrder);

  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(path.join(DIST_DIR, "books"), { recursive: true });

  if (existsSync(PUBLIC_DIR)) {
    await cp(PUBLIC_DIR, DIST_DIR, { recursive: true });
  }
  for (const book of books) {
    await cp(path.join(HTML_DIR, `${book.slug}.html`), path.join(DIST_DIR, book.href));
  }

  for (const locale of LOCALES) {
    const dir = locale.path ? path.join(DIST_DIR, locale.path) : DIST_DIR;
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), renderIndex(config, shelves, locale), "utf8");
  }

  const size = (await stat(path.join(DIST_DIR, "index.html"))).size;
  console.log(
    `built dist/ — ${books.length} book(s) on ${shelves.length} shelf(s), ${LOCALES.length} language(s), index ${size} bytes`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
